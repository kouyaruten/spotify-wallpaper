"use client";

import React, { useState, useEffect, useRef } from "react";
import ColorThief from "colorthief";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import useLocalStorage from "@/hooks/useLocalStorage";

const IPhoneWallpaper = () => {
  const [url, setUrl] = useLocalStorage("spotifyUrl", "");
  const [coverUrl, setCoverUrl] = useLocalStorage("coverUrl", "");
  const [mainText, setMainText] = useLocalStorage("mainText", "");
  const [secondaryText, setSecondaryText] = useLocalStorage(
    "secondaryText",
    "FictionJunction"
  );
  const [gradientColors, setGradientColors] = useLocalStorage(
    "gradientColors",
    []
  );
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  // 新增状态
  const [screenSize, setScreenSize] = useLocalStorage(
    "screenSize",
    "iPhone 16"
  );
  const [coverSize, setCoverSize] = useLocalStorage("coverSize", 900);
  const [cornerRadius, setCornerRadius] = useLocalStorage("cornerRadius", 100);
  const [coverPosition, setCoverPosition] = useLocalStorage(
    "coverPosition",
    1100
  );

  // 屏幕尺寸配置
  const screenSizes = {
    "iPhone 16": { width: 1179, height: 2556 },
    "iPhone 16 Pro": { width: 1206, height: 2622 },
    "iPhone 16 Pro Max": { width: 1320, height: 2868 },
    "iPhone 16 Plus": { width: 1290, height: 2796 },
    "iPhone 14 & 15 Pro Max": { width: 1290, height: 2796 },
    "iPhone 14 & 15 Pro": { width: 1179, height: 2556 },
    "iPhone 13 & 14": { width: 1170, height: 2532 },
    Android: { width: 1236, height: 2751 },
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
      setMainText(response.data.albumName);
    } catch (err) {
      setError("Error fetching cover art. Please check the URL and try again.");
    }
  };

  useEffect(() => {
    // 将所有依赖于 localStorage 的逻辑移到这里
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
    // ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    // ctx.shadowBlur = 40;
    // ctx.shadowOffsetX = 0;
    // ctx.shadowOffsetY = 20;
    // ctx.shadowSpread = -40;

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

    // 如果选择显示专辑名称，则绘制文本
    // if (showAlbumName && mainText) {
    //   ctx.font = `600 ${fontSize}px ${fontFamily}`;
    //   ctx.fillStyle = "white";
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "top";

    //   // 添加文本阴影
    //   // ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    //   // ctx.shadowBlur = 10;
    //   // ctx.shadowOffsetX = 2;
    //   // ctx.shadowOffsetY = 2;

    //   // 绘制文本
    //   const textY = y + coverSize + 60;
    //   ctx.fillText(mainText, IPHONE_WIDTH / 2, textY);

    //   // Secondary text
    //   ctx.font = `400 ${fontSize * 0.8}px ${fontFamily}`;
    //   const textY2 = textY + 60;
    //   ctx.fillText(secondaryText, IPHONE_WIDTH / 2, textY2);

    //   // 重置阴影
    //   ctx.shadowColor = "transparent";
    //   ctx.shadowBlur = 0;
    //   ctx.shadowOffsetX = 0;
    //   ctx.shadowOffsetY = 0;
    // }
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
      <div className="w-1/3 p-8 pl-24 overflow-y-auto flex flex-col justify-center gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Get{" "}
            <span className="font-bold text-pink-500">Apple-Music-Like</span>{" "}
            Wallpapers from{" "}
            <span className="font-bold text-green-500">Spotify</span> Albums
          </h1>
          <p>
            1. Open the Spotify album page
            <br />
            2. Get its link by... <br />
            &nbsp;&nbsp;a. Spotify browser: copy the URL
            <br />
            &nbsp;&nbsp;b. Spotify desktop app: right click title &gt; share
            &gt; copy link
            <br />
            3. Paste link below
          </p>
          <Input
            className="w-full"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Spotify URL"
          />
          <Button onClick={fetchCoverArt}>Generate</Button>
        </div>

        {/* 控制组件 */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm mb-2">Screen Size</label>
              <Select
                value={screenSize}
                onValueChange={(e) => setScreenSize(e)}
                className="w-full p-2 border rounded mt-1"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.keys(screenSizes).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                Cover Size: {coverSize}px
              </label>
              <Slider
                min={600}
                max={1200}
                step={10}
                value={[coverSize]}
                onValueChange={(e) => setCoverSize(e[0])}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                Corner Radius: {cornerRadius}px
              </label>
              <Slider
                min={0}
                max={200}
                step={10}
                value={[cornerRadius]}
                onValueChange={(e) => setCornerRadius(e[0])}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm">
                Cover Position: {coverPosition}px from top
              </label>
              <Slider
                min={0}
                max={screenSizes[screenSize].height - coverSize}
                step={10}
                value={[coverPosition]}
                onValueChange={(e) => setCoverPosition(e[0])}
                className="w-full"
              />
            </div>
          </div>
        </div>
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
        <p className="text-sm text-gray-500">
          built with ♥ by{" "}
          <a href="https://x.com/williamjinq" className="hover:text-green-500">
            @williamjinq
          </a>
          , inspired by{" "}
          <a
            href="https://www.spotifycover.art/"
            className="hover:text-green-500"
          >
            spotifycover.art
          </a>
          .
        </p>
      </div>

      {/* 右侧面板 */}
      <div className="w-2/3 p-8 flex flex-col items-center justify-center gap-4">
        {coverUrl && (
          <>
            <div className="shadow-2xl rounded-3xl overflow-hidden">
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "auto", maxWidth: "390px" }}
              />
            </div>
            <Button onClick={downloadWallpaper}>Download Wallpaper</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default IPhoneWallpaper;
