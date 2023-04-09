import { formatCurrency } from "@utils/number";
import Chart from "react-apexcharts";

interface IProps {
    xLabels: any[],
    series: {
        name: string,
        data: number[]
    }[]
}

export default function ChartLine({ xLabels, series }: IProps) {

    const options = {
        chart: {
            id: "basic-bar"
        },
        xaxis: {
            categories: xLabels
        },
        tooltip: {
            enabled: false,
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                return '<div class="arrow_box">' +
                    '<span class="p-3">' + formatCurrency(series[seriesIndex][dataPointIndex] + "") + '</span>' +
                    '</div>'
            }
        },
        yaxis: {
            labels: {
                formatter: function (val, index) {
                    return formatCurrency(val + "")
                }
            }
        }
    }

    return (
        <div>
            <Chart
                options={options}
                series={series}
                type="line"
                width="100%"
            />
        </div>
    )
}