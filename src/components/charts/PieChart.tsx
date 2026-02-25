import { ResponsivePie } from '@nivo/pie'
import type { PieSvgProps, DefaultRawDatum } from '@nivo/pie'
import { dashboardChartTheme, chartColors } from './chart-theme'

type PieChartProps<T extends DefaultRawDatum> = Pick<
  PieSvgProps<T>,
  | 'data'
  | 'margin'
  | 'innerRadius'
  | 'padAngle'
  | 'colors'
  | 'enableArcLabels'
  | 'enableArcLinkLabels'
  | 'arcLinkLabel'
  | 'arcLabel'
  | 'arcLabelsComponent'
  | 'arcLabelsTextColor'
  | 'arcLinkLabelComponent'
  | 'valueFormat'
  | 'tooltip'
>

export function PieChart<T extends DefaultRawDatum>({
  data,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  innerRadius = 0.5,
  padAngle = 0.7,
  colors = chartColors.segments,
  enableArcLabels = true,
  enableArcLinkLabels = true,
  ...rest
}: PieChartProps<T>) {
  return (
    <ResponsivePie
      data={data}
      margin={margin}
      innerRadius={innerRadius}
      padAngle={padAngle}
      cornerRadius={4}
      activeOuterRadiusOffset={6}
      colors={colors}
      enableArcLabels={enableArcLabels}
      enableArcLinkLabels={enableArcLinkLabels}
      arcLinkLabelsSkipAngle={10}
      arcLabelsSkipAngle={10}
      theme={dashboardChartTheme}
      animate
      motionConfig="gentle"
      {...rest}
    />
  )
}
