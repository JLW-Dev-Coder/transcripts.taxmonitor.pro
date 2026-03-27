export type CtaType = 'transcript-analysis' | 'free-trial' | 'demo' | 'buy'
export type TemplateType = 'irs-code' | 'explainer' | 'comparison' | 'how-to' | 'sales'

export interface Resource {
  slug: string
  title: string
  template: TemplateType
  category: string
  cta: CtaType
  description: string
  content: string
  related: string[]
}
