import { z } from 'zod';

/**
 * Service types and their base pricing
 */
export const ServiceTypes = {
  TAX_PLANNING: 'tax-planning',
  FINANCIAL_REVIEW: 'financial-review',
  INVESTMENT_ADVISORY: 'investment-advisory',
  BUSINESS_CONSULTING: 'business-consulting',
  TAX_PREPARATION: 'tax-preparation'
} as const;

/**
 * Service pricing configuration
 */
export const ServicePricing: Record<ServiceType, ServicePriceConfig> = {
  [ServiceTypes.TAX_PLANNING]: {
    basePrice: 200.00,
    hourlyRate: 150.00,
    minimumHours: 1
  },
  [ServiceTypes.FINANCIAL_REVIEW]: {
    basePrice: 150.00,
    hourlyRate: 125.00,
    minimumHours: 1
  },
  [ServiceTypes.INVESTMENT_ADVISORY]: {
    basePrice: 250.00,
    hourlyRate: 175.00,
    minimumHours: 1.5
  },
  [ServiceTypes.BUSINESS_CONSULTING]: {
    basePrice: 300.00,
    hourlyRate: 200.00,
    minimumHours: 2
  },
  [ServiceTypes.TAX_PREPARATION]: {
    basePrice: 175.00,
    hourlyRate: 125.00,
    minimumHours: 1
  }
};

/**
 * Discount tiers based on total service value
 */
export const DiscountTiers = [
  { threshold: 5000, percentage: 0.10 },
  { threshold: 2500, percentage: 0.05 },
  { threshold: 1000, percentage: 0.03 }
];

/**
 * Service type definition
 */
export type ServiceType = typeof ServiceTypes[keyof typeof ServiceTypes];

/**
 * Service price configuration interface
 */
export interface ServicePriceConfig {
  basePrice: number;
  hourlyRate: number;
  minimumHours: number;
}

/**
 * Service request interface
 */
export interface ServiceRequest {
  type: ServiceType;
  hours?: number;
  quantity?: number;
  addons?: ServiceAddon[];
}

/**
 * Service addon interface
 */
export interface ServiceAddon {
  name: string;
  price: number;
  quantity?: number;
}

/**
 * Cost breakdown interface
 */
export interface CostBreakdown {
  subtotal: number;
  addons: number;
  discount: number;
  total: number;
  details: {
    basePrice: number;
    hourlyCharges: number;
    addonBreakdown: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    appliedDiscount: {
      percentage: number;
      amount: number;
    };
  };
}

/**
 * Input validation schema
 */
const serviceRequestSchema = z.object({
  type: z.enum([
    ServiceTypes.TAX_PLANNING,
    ServiceTypes.FINANCIAL_REVIEW,
    ServiceTypes.INVESTMENT_ADVISORY,
    ServiceTypes.BUSINESS_CONSULTING,
    ServiceTypes.TAX_PREPARATION
  ]),
  hours: z.number().min(0).optional(),
  quantity: z.number().min(1).optional(),
  addons: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1).optional()
  })).optional()
});

/**
 * Calculates the total cost for requested services including any applicable discounts
 * @param services - Array of service requests
 * @returns Detailed cost breakdown
 * @throws Error if input validation fails
 */
export function calculateServicesCost(services: ServiceRequest[]): CostBreakdown {
  try {
    // Validate input
    services.forEach(service => {
      serviceRequestSchema.parse(service);
    });

    let totalBasePrice = 0;
    let totalHourlyCharges = 0;
    let totalAddons = 0;
    const addonBreakdown: CostBreakdown['details']['addonBreakdown'] = [];

    // Calculate base costs
    services.forEach(service => {
      const pricing = ServicePricing[service.type];
      const quantity = service.quantity || 1;
      const hours = Math.max(service.hours || 0, pricing.minimumHours);

      totalBasePrice += pricing.basePrice * quantity;
      totalHourlyCharges += pricing.hourlyRate * hours * quantity;

      // Calculate addon costs
      if (service.addons) {
        service.addons.forEach(addon => {
          const addonQuantity = addon.quantity || 1;
          const addonTotal = addon.price * addonQuantity;
          totalAddons += addonTotal;

          addonBreakdown.push({
            name: addon.name,
            quantity: addonQuantity,
            price: addon.price,
            total: addonTotal
          });
        });
      }
    });

    const subtotal = totalBasePrice + totalHourlyCharges + totalAddons;

    // Calculate discount
    const applicableDiscount = DiscountTiers.find(tier => subtotal >= tier.threshold);
    const discountPercentage = applicableDiscount?.percentage || 0;
    const discountAmount = roundToTwoDecimals(subtotal * discountPercentage);

    const total = roundToTwoDecimals(subtotal - discountAmount);

    return {
      subtotal: roundToTwoDecimals(subtotal),
      addons: roundToTwoDecimals(totalAddons),
      discount: discountAmount,
      total,
      details: {
        basePrice: roundToTwoDecimals(totalBasePrice),
        hourlyCharges: roundToTwoDecimals(totalHourlyCharges),
        addonBreakdown,
        appliedDiscount: {
          percentage: discountPercentage * 100,
          amount: discountAmount
        }
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid service request: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Rounds a number to two decimal places
 */
function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}