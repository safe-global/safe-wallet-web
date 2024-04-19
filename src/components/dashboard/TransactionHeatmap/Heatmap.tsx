import { useTheme } from '@mui/material'

const indexToX = (idx: number): number => 32 + Math.floor(idx / 7) * 20

const indexToY = (idx: number): number => (idx % 7) * 20

export const Heatmap = ({ width, heatMapData }: { width: number; heatMapData: number[] }) => {
  const theme = useTheme()

  return (
    <svg viewBox={`0 0 ${width} 140`} style={{ padding: '16px' }}>
      <g>
        <text x={0} y={32} fill="#fff" fontSize={12}>
          Mon
        </text>
        <text x={0} y={72} fill="#fff" fontSize={12}>
          Wed
        </text>
        <text x={0} y={112} fill="#fff" fontSize={12}>
          Fri
        </text>
        {heatMapData.map((txCount, idx) => (
          <g key={idx}>
            <rect
              rx={4}
              fill={theme.palette.background.default}
              x={indexToX(idx)}
              y={indexToY(idx)}
              width={16}
              height={16}
            />
            <rect
              rx={4}
              fill={theme.palette.primary.main}
              opacity={Math.min(1, txCount / 5)}
              x={indexToX(idx)}
              y={indexToY(idx)}
              width={16}
              height={16}
            >
              <animate attributeName="opacity" values={`0;${Math.min(1, txCount / 5)}`} dur="2s" repeatCount="1" />
            </rect>
          </g>
        ))}
      </g>
    </svg>
  )
}
