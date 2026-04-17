import { scaleBand, scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';

import { ParagraphText } from '../Typography';

import { DataType, IndicatorsMetaDataType } from '@/Types';

interface Props {
  data: DataType[];
  radius: number;
  innerRadiusRatio: number;
  marginSide: number;
  marginTop: number;
  indicatorMetaData: IndicatorsMetaDataType;
  maxValue: number;
  isMobile: boolean;
}

export const Graph = ({
  data,
  radius,
  innerRadiusRatio,
  marginSide,
  marginTop,
  indicatorMetaData,
  maxValue,
  isMobile,
}: Props) => {
  const subIndicatorsMetaData = indicatorMetaData.subIndicators;
  const startAngle = isMobile ? Math.PI : -Math.PI / 2;
  const endAngle = isMobile ? 2 * Math.PI : Math.PI / 2;
  const x = scaleBand()
    .domain([...new Set(subIndicatorsMetaData.map(d => d.id))])
    .range([startAngle, endAngle]);
  const r = scaleLinear()
    .domain([0, maxValue])
    .range([0, radius * (1 - innerRadiusRatio)]);

  const mobileLabelPositions = isMobile
    ? (() => {
        const labels = subIndicatorsMetaData.map(d => {
          const angle = (x(d.id)! + (x(d.id)! + (x.bandwidth() as number))) / 2;
          const anchorX = (radius + 16) * Math.sin(angle);
          const anchorY = (radius + 16) * Math.cos(angle) * -1;
          return {
            id: d.id,
            angle,
            anchorX,
            anchorY,
            targetY: anchorY,
          };
        });
        const sorted = [...labels].sort((a, b) => a.targetY - b.targetY);
        const minGap = 22;
        for (let i = 1; i < sorted.length; i += 1) {
          if (sorted[i].targetY - sorted[i - 1].targetY < minGap) {
            sorted[i].targetY = sorted[i - 1].targetY + minGap;
          }
        }
        return new Map(sorted.map(label => [label.id, label]));
      })()
    : new Map();

  // On mobile the arc faces left; center must sit near the RIGHT edge of the
  // SVG so labels (which extend leftward by up to radius+68px) are not clipped.
  const MOBILE_LABEL_SPACE = 88; // px to the left of center reserved for labels
  const MOBILE_RIGHT_PAD = 12;  // px to the right of center (flat edge)
  const mobileSvgWidth = radius + MOBILE_LABEL_SPACE + MOBILE_RIGHT_PAD;
  const mobileCenterX = radius + MOBILE_LABEL_SPACE;
  const mobileSvgHeight = radius * 2 + marginTop * 2;

  return (
    <>
      <svg
        width={isMobile ? mobileSvgWidth : (radius + marginSide) * 2}
        height={isMobile ? mobileSvgHeight : radius + marginTop}
        className='overflow-visible'
      >
        <defs>
          <radialGradient
            id={`${indicatorMetaData.mainIndicatorId}-radial-gradient`}
            gradientUnits='userSpaceOnUse'
            r={radius}
            cx={0}
            cy={0}
            fr={radius * innerRadiusRatio}
            fx={0}
            fy={0}
          >
            <stop
              offset='10%'
              stopColor={indicatorMetaData.gradientColor.split(',')[0]}
            />
            <stop
              offset='90%'
              stopColor={indicatorMetaData.gradientColor.split(',')[1]}
            />
          </radialGradient>
        </defs>
        <g
          transform={`translate(${isMobile ? mobileCenterX : radius + marginSide},${isMobile ? radius + marginTop : radius + marginTop})`}
        >
          <path
            d={
              arc()({
                innerRadius: radius * innerRadiusRatio,
                outerRadius: radius,
                startAngle,
                endAngle,
              }) as string
            }
            fill='#fff'
          />
          {subIndicatorsMetaData.map((d, i) => {
            const startAngle = x(d.id)!;
            const endAngle = startAngle + (x.bandwidth() as number);
            const angle = (startAngle + endAngle) / 2;
            const val = data.find(el => el.id === d.id)?.numericValue || 0;
            const valueText =
              data.find(el => el.id === d.id)?.numericValue ?? 'NA';
            const shortLabel =
              d.name.length > 20 ? `${d.name.slice(0, 20).trim()}...` : d.name;
            return (
              <g key={i}>
                <path
                  d={
                    arc()({
                      innerRadius: radius * innerRadiusRatio,
                      outerRadius: radius,
                      startAngle: x(d.id) as number,
                      endAngle: x(d.id)! + (x.bandwidth() as number),
                    }) as string
                  }
                  fill='#F3F4F6'
                  strokeWidth={2}
                  stroke='#fff'
                />
                <line
                  x1={(radius + 5) * Math.sin(angle)}
                  y1={(radius + 5) * Math.cos(angle) * -1}
                  x2={(radius + 15) * Math.sin(angle)}
                  y2={(radius + 15) * Math.cos(angle) * -1}
                  strokeWidth={1}
                  fill='none'
                  stroke='#F7F7F7'
                />
                {isMobile && mobileLabelPositions.get(d.id) && (
                  <>
                    <polyline
                      points={`${mobileLabelPositions.get(d.id)!.anchorX},${mobileLabelPositions.get(d.id)!.anchorY} ${mobileLabelPositions.get(d.id)!.anchorX - 12},${mobileLabelPositions.get(d.id)!.targetY} ${mobileLabelPositions.get(d.id)!.anchorX - 48},${mobileLabelPositions.get(d.id)!.targetY}`}
                      fill='none'
                      stroke='#fff'
                      strokeWidth={1}
                      opacity={0.7}
                    />
                    <text
                      x={mobileLabelPositions.get(d.id)!.anchorX - 52}
                      y={mobileLabelPositions.get(d.id)!.targetY - 2}
                      textAnchor='end'
                      fill='#fff'
                      style={{
                        fontSize: '10px',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      <title>{d.name}</title>
                      {shortLabel}
                    </text>
                    <text
                      x={mobileLabelPositions.get(d.id)!.anchorX - 52}
                      y={mobileLabelPositions.get(d.id)!.targetY + 10}
                      textAnchor='end'
                      fill='#fff'
                      opacity={0.8}
                      style={{
                        fontSize: '9px',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {valueText === 'NA' ? 'NA' : `${Number(valueText).toFixed(2)}%`}
                    </text>
                  </>
                )}
                {!isMobile && (
                  <foreignObject
                    x={
                      (radius +
                        30 +
                        50 * Math.abs(Math.sin(angle)) +
                        20 * (1 - Math.abs(Math.sin(angle)))) *
                        Math.sin(angle) -
                      65
                    }
                    y={
                      (radius +
                        30 +
                        50 * Math.abs(Math.sin(angle)) +
                        20 * (1 - Math.abs(Math.sin(angle)))) *
                        Math.cos(angle) *
                        -1 -
                      30
                    }
                    width={130}
                    height={60}
                    style={{ overflow: 'visible' }}
                  >
                    <div className='w-full h-full flex items-center flex-col justify-end'>
                      <ParagraphText
                        size='sm'
                        weight='bold'
                        leading='snug'
                        alignment='center'
                        marginBottom='none'
                      >
                        {d.name}
                      </ParagraphText>
                      <ParagraphText size='xs' weight='light' leading='loose'>
                        {valueText === 'NA' ? 'NA' : `${valueText}%`}
                      </ParagraphText>
                    </div>
                  </foreignObject>
                )}
                <path
                  d={
                    arc()({
                      innerRadius: radius * innerRadiusRatio,
                      outerRadius: radius * innerRadiusRatio + r(val),
                      startAngle: x(d.id) as number,
                      endAngle: x(d.id)! + (x.bandwidth() as number),
                    }) as string
                  }
                  fill={`url(#${indicatorMetaData.mainIndicatorId}-radial-gradient)`}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );
};
