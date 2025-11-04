'use client';

import { ArrowRight, Coffee, LineChart, Package } from 'lucide-react';
import { ComponentProps } from 'react';

export function CafeIcon(props: ComponentProps<typeof Coffee>) {
  return <Coffee aria-hidden {...props} />;
}

export function LineChartIcon(props: ComponentProps<typeof LineChart>) {
  return <LineChart aria-hidden {...props} />;
}

export function PackageIcon(props: ComponentProps<typeof Package>) {
  return <Package aria-hidden {...props} />;
}

export function ArrowRightIcon(props: ComponentProps<typeof ArrowRight>) {
  return <ArrowRight aria-hidden {...props} />;
}
