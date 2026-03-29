import type { TemplateType } from './types'
import IRSCodeTemplate from '@/components/templates/IRSCodeTemplate'
import ExplainerTemplate from '@/components/templates/ExplainerTemplate'
import ComparisonTemplate from '@/components/templates/ComparisonTemplate'
import HowToTemplate from '@/components/templates/HowToTemplate'
import SalesTemplate from '@/components/templates/SalesTemplate'

const TEMPLATE_MAP = {
  'irs-code': IRSCodeTemplate,
  'explainer': ExplainerTemplate,
  'comparison': ComparisonTemplate,
  'how-to': HowToTemplate,
  'sales': SalesTemplate,
} as const satisfies Record<TemplateType, React.ComponentType<any>>

export function getTemplate(type: TemplateType) {
  return TEMPLATE_MAP[type] ?? IRSCodeTemplate
}
