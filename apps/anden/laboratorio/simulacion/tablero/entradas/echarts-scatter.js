import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import { GridComponent, DataZoomComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([ScatterChart, GridComponent, DataZoomComponent, TooltipComponent, CanvasRenderer]);
export { echarts };
