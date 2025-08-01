// Helper functions for creating specialized cultural intelligence sales agents

import { vapiServer } from '@/lib/vapi/vapiServer'
import { interviewAgentPrompt, firstMessage } from '@/lib/vapiConfig'

export interface CulturalSalesAgentConfig {
  name: string
  industry?: string // e.g., "Technology", "Healthcare", "Finance", "Retail"
  product?: string // e.g., "SaaS Platform", "Consulting Services", "Enterprise Software"
  customInstructions?: string
}

export const createCulturalSalesAgent = async (config: CulturalSalesAgentConfig) => {
  try {
    // Customize the prompt based on the industry and product
    let customizedPrompt = interviewAgentPrompt.replace(
      /hiring|interview|candidate/gi, 
      (match) => {
        const replacements: { [key: string]: string } = {
          'hiring': 'sales',
          'interview': 'sales conversation',
          'candidate': 'prospect'
        }
        return replacements[match.toLowerCase()] || match
      }
    )
    
    if (config.industry) {
      customizedPrompt += `\n\n## Industry-Specific Focus\nThis sales conversation is specifically for the ${config.industry} industry. Tailor your approach and cultural references accordingly.`
    }
    
    if (config.product) {
      const productGuidance = {
        "SaaS Platform": "Focus on scalability, integration capabilities, and ROI. Understand their current tech stack and pain points.",
        "Consulting Services": "Emphasize expertise, proven methodology, and custom solutions. Build trust through case studies and cultural understanding.",
        "Enterprise Software": "Highlight security, compliance, and enterprise-grade features. Focus on decision-making processes and stakeholder buy-in."
      }
      
      customizedPrompt += `\n\n## Product Focus: ${config.product}\n${productGuidance[config.product as keyof typeof productGuidance] || 'Focus on value proposition and cultural fit.'}`
    }
    
    if (config.customInstructions) {
      customizedPrompt += `\n\n## Additional Cultural Intelligence Instructions\n${config.customInstructions}`
    }

    // Customize the first message for sales context
    let customFirstMessage = firstMessage.replace(
      /interview|HireFlow/gi,
      (match) => {
        const replacements: { [key: string]: string } = {
          'interview': 'business conversation',
          'HireFlow': 'CultureFlow'
        }
        return replacements[match.toLowerCase()] || match
      }
    )
    
    if (config.industry) {
      customFirstMessage = `Hello! Welcome to CultureFlow, where we transform sales through cultural intelligence. I'm Alex, your cultural sales consultant, and I'm excited to understand your business needs in the ${config.industry} space. How has your day been going so far?`
    }

    const assistant = await vapiServer.assistants.create({
      name: config.name,
      voice: {
        provider: 'vapi',
        voiceId: 'Alex',
      },
      firstMessage: customFirstMessage,
      model: {
        model: 'gpt-4.1',
        provider: 'openai',
        messages: [
          {
            role: 'system',
            content: customizedPrompt,
          },
        ],
        temperature: 0.7,
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        keywords: ['CultureFlow', 'sales', 'cultural', 'intelligence', 'prospect', config.industry?.toLowerCase() || '']
      },
      endCallFunctionEnabled: true,
      endCallMessage: `Thank you for your time today. Your ${config.industry || 'business'} consultation has been completed successfully. You should hear back from our cultural sales team within the next few business days. Have a great day!`,
      maxDurationSeconds: 360, 
      serverMessages: [],
    })

    return {
      success: true,
      status: 200,
      data: assistant,
    }
  } catch (error: unknown) {
    console.error('Error creating cultural sales agent:', error)
    
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      const err = error as { statusCode?: number; message?: string }
      if (err.statusCode === 401) {
        return {
          success: false,
          status: 401,
          message: 'Authentication failed. Please check your VAPI credentials.',
        }
      }
      if (err.statusCode === 400) {
        return {
          success: false,
          status: 400,
          message: 'Invalid request. Please check your agent configuration.',
        }
      }
    }
    
    return {
      success: false,
      status: 500,
      message: 'Failed to create cultural sales agent. Please try again.',
    }
  }
}

// Predefined cultural sales agent templates
export const culturalSalesAgentTemplates = {
  technologySales: {
    name: "Technology Sales Consultant",
    industry: "Technology",
    customInstructions: "Focus on innovation, digital transformation, and tech adoption. Understand their current technology stack, scalability needs, and integration challenges."
  },
  
  healthcareSales: {
    name: "Healthcare Sales Specialist", 
    industry: "Healthcare",
    customInstructions: "Focus on compliance, patient outcomes, and healthcare efficiency. Understand regulatory requirements, patient privacy concerns, and workflow integration."
  },
  
  financeSales: {
    name: "Financial Services Consultant",
    industry: "Finance", 
    customInstructions: "Focus on security, compliance, ROI, and risk management. Understand regulatory requirements, data protection, and financial impact."
  },
  
  retailSales: {
    name: "Retail & E-commerce Specialist",
    industry: "Retail",
    customInstructions: "Focus on customer experience, conversion optimization, inventory management, and omnichannel strategies. Understand seasonal patterns and customer behavior."
  },
  
  consultingSales: {
    name: "Consulting Services Specialist", 
    industry: "Consulting",
    customInstructions: "Focus on expertise demonstration, methodology explanation, and custom solutions. Build trust through case studies and proven track record."
  },
  
  enterpriseSales: {
    name: "Enterprise Solutions Consultant",
    industry: "Enterprise", 
    customInstructions: "Focus on scalability, security, integration, and enterprise-grade features. Understand complex decision-making processes and stakeholder management."
  }
}

// Quick create functions for common industries
export const createTechnologySalesAgent = (name?: string, product?: string) => 
  createCulturalSalesAgent({
    ...culturalSalesAgentTemplates.technologySales,
    name: name || culturalSalesAgentTemplates.technologySales.name,
    product: product
  })

export const createHealthcareSalesAgent = (name?: string, product?: string) => 
  createCulturalSalesAgent({
    ...culturalSalesAgentTemplates.healthcareSales,
    name: name || culturalSalesAgentTemplates.healthcareSales.name,
    product: product
  })

export const createFinanceSalesAgent = (name?: string, product?: string) => 
  createCulturalSalesAgent({
    ...culturalSalesAgentTemplates.financeSales,
    name: name || culturalSalesAgentTemplates.financeSales.name,
    product: product
  })

export const createRetailSalesAgent = (name?: string, product?: string) => 
  createCulturalSalesAgent({
    ...culturalSalesAgentTemplates.retailSales,
    name: name || culturalSalesAgentTemplates.retailSales.name,
    product: product
  })

export const createConsultingSalesAgent = (name?: string, product?: string) => 
  createCulturalSalesAgent({
    ...culturalSalesAgentTemplates.consultingSales,
    name: name || culturalSalesAgentTemplates.consultingSales.name,
    product: product
  })

export const createEnterpriseSalesAgent = (name?: string, product?: string) => 
  createCulturalSalesAgent({
    ...culturalSalesAgentTemplates.enterpriseSales,
    name: name || culturalSalesAgentTemplates.enterpriseSales.name,
    product: product
  })

// Legacy exports for backward compatibility - now redirect to sales agents
export const createHiringAgent = createCulturalSalesAgent
export const createFrontendInterviewer = createTechnologySalesAgent
export const createBackendInterviewer = createTechnologySalesAgent
export const createFullStackInterviewer = createTechnologySalesAgent
export const createDataScienceInterviewer = createTechnologySalesAgent
export const createProductManagerInterviewer = createConsultingSalesAgent
export const createDevOpsInterviewer = createTechnologySalesAgent
