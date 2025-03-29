import { Chart, PieController, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

// Register the necessary Chart.js components
Chart.register(PieController, ArcElement, Tooltip, Legend, Title);

export const generateChart = async (right, wrong, average) => {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: [`Right (${right})`, `Wrong (${wrong})`, `Average (${average})`], // Added numbers in labels
      datasets: [
        {
          data: [right, wrong, average],
          backgroundColor: ["#059BFF", "#FF4069", "#FFC234"],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 14,
            },
          },
        },
        title: {
          display: true,
          text: "Assessment Results: Right, Wrong & Average Answers",
          font: {
            size: 16,
          },
          padding: 10,
        },
      },
    },
  });

  const chartPath = path.join("./reports", "chart.png");

  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(chartPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => resolve(chartPath));
    out.on("error", reject);
  });
};
