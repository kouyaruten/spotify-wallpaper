"use client";

import React, { useState, useEffect, useRef } from "react";
import ColorThief from "colorthief";
import axios from "axios";

const IPhoneWallpaper = () => {
  const [url, setUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [gradientColors, setGradientColors] = useState([]);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  // 新增状态
  const [screenSize, setScreenSize] = useState("iPhone 15 Pro Max");
  const [coverSize, setCoverSize] = useState(900);
  const [cornerRadius, setCornerRadius] = useState(40);
  const [shadowBlur, setShadowBlur] = useState(40);
  const [coverPosition, setCoverPosition] = useState(1100);

  // 屏幕尺寸配置
  const screenSizes = {
    "iPhone 15 Pro Max": { width: 1290, height: 2796 },
    "iPhone 15 Pro": { width: 1179, height: 2556 },
    "iPhone 15": { width: 1179, height: 2556 },
    "iPhone 15 Plus": { width: 1284, height: 2778 },
  };

  const fetchCoverArt = async () => {
    setError("");
    setCoverUrl("");
    setGradientColors([]);

    if (!url) {
      setError("Please enter a Spotify URL");
      return;
    }

    try {
      const response = await axios.post("/api/spotify-cover", { url });
      setCoverUrl(response.data.coverUrl);
    } catch (err) {
      setError("Error fetching cover art. Please check the URL and try again.");
    }
  };

  useEffect(() => {
    if (coverUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = coverUrl;
      img.onload = () => {
        const colorThief = new ColorThief();
        const mainColor = colorThief.getColor(img);
        setGradientColors([mainColor]);

        drawWallpaper(img, mainColor);
      };
    }
  }, [coverUrl, screenSize, coverSize, cornerRadius, coverPosition]);

  const drawWallpaper = (img, mainColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { width: IPHONE_WIDTH, height: IPHONE_HEIGHT } =
      screenSizes[screenSize];
    canvas.width = IPHONE_WIDTH;
    canvas.height = IPHONE_HEIGHT;

    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, IPHONE_HEIGHT);
    const lighterColor = lightenColor(mainColor, 15);
    const darkerColor = darkenColor(mainColor, 15);

    gradient.addColorStop(0, `rgb(${mainColor.join(",")})`);
    gradient.addColorStop(0.5, `rgb(${lighterColor.join(",")})`);
    gradient.addColorStop(1, `rgb(${darkerColor.join(",")})`);

    // 绘制渐变背景
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, IPHONE_WIDTH, IPHONE_HEIGHT);

    // 绘制专辑封面
    const x = (IPHONE_WIDTH - coverSize) / 2;
    const y = coverPosition;

    // 保存当前上下文状态
    ctx.save();

    // 添加阴影
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;

    // 创建圆角矩形路径
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + coverSize - cornerRadius, y);
    ctx.quadraticCurveTo(x + coverSize, y, x + coverSize, y + cornerRadius);
    ctx.lineTo(x + coverSize, y + coverSize - cornerRadius);
    ctx.quadraticCurveTo(
      x + coverSize,
      y + coverSize,
      x + coverSize - cornerRadius,
      y + coverSize
    );
    ctx.lineTo(x + cornerRadius, y + coverSize);
    ctx.quadraticCurveTo(x, y + coverSize, x, y + coverSize - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();

    // 填充路径（这会应用阴影）
    ctx.fillStyle = "white";
    ctx.fill();

    // 移除阴影
    ctx.shadowColor = "transparent";

    // 裁剪和绘制图像
    ctx.clip();
    ctx.drawImage(img, x, y, coverSize, coverSize);

    // 恢复上下文状态
    ctx.restore();
  };

  // 辅助函数：使颜色变浅
  const lightenColor = (color, amount) => {
    return color.map((c) =>
      Math.min(255, Math.round(c + (255 - c) * (amount / 100)))
    );
  };

  //助函数：使颜色变深
  const darkenColor = (color, amount) => {
    return color.map((c) => Math.max(0, Math.round(c - c * (amount / 100))));
  };

  const downloadWallpaper = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "iphone-wallpaper.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 左侧面板 */}
      <div className="w-1/3 p-8 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Spotify URL"
              className="w-full p-2 mb-2 border rounded"
            />
            <button
              onClick={fetchCoverArt}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Generate Wallpaper
            </button>
          </div>
        </div>

        {/* 控制组件 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4">
            <label className="block mb-4">
              Screen Size:
              <select
                value={screenSize}
                onChange={(e) => setScreenSize(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              >
                {Object.keys(screenSizes).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-2">
              Cover Size:
              <input
                type="range"
                min="600"
                max="1200"
                value={coverSize}
                onChange={(e) => setCoverSize(Number(e.target.value))}
                className="w-full"
              />
              {coverSize}px
            </label>
            <label className="block mb-2">
              Corner Radius:
              <input
                type="range"
                min="0"
                max="100"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
                className="w-full"
              />
              {cornerRadius}px
            </label>

            <label className="block mb-2">
              Cover Position:
              <input
                type="range"
                min="0"
                max={screenSizes[screenSize].height - coverSize}
                value={coverPosition}
                onChange={(e) => setCoverPosition(Number(e.target.value))}
                className="w-full"
              />
              {coverPosition}px from top
            </label>
          </div>
        </div>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* 右侧面板 */}
      <div className="w-2/3 p-8 flex items-center justify-center">
        {coverUrl ? (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "auto", maxWidth: "390px" }}
            />
            <div className="p-4">
              <button
                onClick={downloadWallpaper}
                className="w-full p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                Download Wallpaper
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white text-2xl font-bold">
            Your wallpaper will appear here
          </div>
        )}
      </div>
    </div>
  );
};

export default IPhoneWallpaper;
