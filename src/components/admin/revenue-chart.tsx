'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPrice } from '@/lib/utils'

export function RevenueChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold">Chiffre d&apos;affaires estime</h2>
      <p className="mt-1 text-sm text-muted">Reservations confirmees, en cours et terminees, sur 6 mois.</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(237 28 36)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="rgb(237 28 36)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(226 232 240)" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="rgb(104 116 140)" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="rgb(104 116 140)"
              width={60}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip
              formatter={(value: number) => [formatPrice(value), 'Total']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgb(226 232 240)',
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="rgb(237 28 36)"
              strokeWidth={2}
              fill="url(#revenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
