"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, AlertCircle, Info, Check, X, Star } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

// Custom colors for chart segments
const COLORS = {
  // Vibrant color palette
  chart1: "hsl(215, 100%, 60%)", // Blue
  chart2: "hsl(150, 80%, 47%)",  // Green
  chart3: "hsl(40, 100%, 60%)",  // Yellow
  chart4: "hsl(345, 80%, 60%)",  // Red
  chart5: "hsl(280, 70%, 60%)",  // Purple
  chart6: "hsl(190, 90%, 55%)",  // Teal
}

// Format large numbers to K, M, B, T format
function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  
  const abbreviations = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  
  if (tier >= abbreviations.length) {
    return num.toExponential(2);
  }
  
  const suffix = abbreviations[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  
  // If the result would be a single digit, show one decimal place
  return scaled < 10 ? 
    scaled.toFixed(1).replace(/\.0$/, '') + suffix : 
    Math.round(scaled) + suffix;
}

export function PieChartCard({ 
  title, 
  data, 
  insights 
}: { 
  title: string; 
  data: { name: string; value: number }[]; 
  insights?: { 
    trend?: number; 
    description?: string;
    icon?: 'trending-up' | 'trending-down' | 'alert' | 'info' | 'check' | 'x' | 'star';
  } 
}) {
  // Calculate total for center text
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  // Convert data format to match the needed structure
  const chartData = React.useMemo(() => {
    return data.map((item, index) => {
      const colorIndex = (index % 6) + 1
      // Create a unique fill color key for each segment with direct color value
      return {
        segment: item.name,
        value: item.value,
        fill: COLORS[`chart${colorIndex}` as keyof typeof COLORS]
      }
    })
  }, [data])

  // Create a chart config based on the data
  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Value",
      }
    }
    
    // Add color configuration for each segment
    data.forEach((item, index) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '-')
      const colorIndex = (index % 6) + 1
      config[key] = {
        label: item.name,
        color: COLORS[`chart${colorIndex}` as keyof typeof COLORS]
      }
    })
    
    return config
  }, [data])

  // Always show footer if insights are provided
  const showFooter = !!insights;
  
  // Helper function to get the appropriate icon
  const getInsightIcon = React.useCallback(() => {
    if (!insights?.icon && insights?.trend !== undefined) {
      return insights.trend >= 0 ? 
        <TrendingUp className="h-4 w-4 text-green-500" /> : 
        <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    
    switch(insights?.icon) {
      case 'trending-up': 
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'trending-down': 
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'alert': 
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'info': 
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'check': 
        return <Check className="h-4 w-4 text-green-500" />;
      case 'x': 
        return <X className="h-4 w-4 text-red-500" />;
      case 'star': 
        return <Star className="h-4 w-4 text-amber-400" />;
      default:
        return null;
    }
  }, [insights]);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={props => {
                const { active, payload } = props;
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  // Ensure value is a number for formatting
                  const numericValue = typeof data.value === 'number' ? data.value : Number(data.value);
                  return (
                    <div className="border-border/50 bg-background min-w-[8rem] rounded-lg border px-3 py-2 text-sm shadow-xl">
                      <div className="font-medium">{data.segment}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: data.fill }}
                        />
                        <span className="font-mono">{new Intl.NumberFormat('en-US').format(numericValue)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="segment"
              innerRadius={70}
              outerRadius={120}
              strokeWidth={5}
              paddingAngle={3}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 5}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatNumber(totalValue)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 28}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            {getInsightIcon()}
            <div className="flex flex-col gap-1">
              {insights?.trend !== undefined && (
                <div className="font-medium leading-tight">
                  {insights.trend > 0 
                    ? `Trending up by ${Math.abs(insights.trend).toFixed(1)}%`
                    : insights.trend < 0 
                      ? `Trending down by ${Math.abs(insights.trend).toFixed(1)}%` 
                      : `No change`}
                </div>
              )}
              {insights?.description && (
                <div className="leading-tight text-muted-foreground">
                  {insights.description}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
