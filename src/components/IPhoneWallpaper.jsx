'use client';

import React, { useState, useEffect, useRef } from 'react';
import ColorThief from 'colorthief';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useLocalStorage from '@/hooks/useLocalStorage';

const IPhoneWallpaper = () => {
  const [url, setUrl] = useState(
    'https://open.spotify.com/album/6eUW0wxWtzkFdaEFsTJto6?highlight=spotify:track:4PTG3Z6ehGkBFwjybzWkR8'
  );
  const [coverUrl, setCoverUrl] = useState('https://i.scdn.co/image/ab67616d0000b27315ebbedaacef61af244262a8');
  const [mainText, setMainText] = useLocalStorage('mainText', '');
  const [secondaryText, setSecondaryText] = useLocalStorage('secondaryText', '');
  const [gradientColors, setGradientColors] = useState('gradientColors', []);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  // 新增状态
  const [screenSize, setScreenSize] = useLocalStorage('screenSize', 'iPhone 16');
  const [coverSize, setCoverSize] = useLocalStorage('coverSize', 900);
  const [cornerRadius, setCornerRadius] = useLocalStorage('cornerRadius', 100);
  const [coverPosition, setCoverPosition] = useLocalStorage('coverPosition', 1100);
  const [isCopied, setIsCopied] = useState(false);

  // 屏幕尺寸配置
  const screenSizes = {
    'iPhone 16': { width: 1179, height: 2556 },
    'iPhone 16 Pro': { width: 1206, height: 2622 },
    'iPhone 16 Pro Max': { width: 1320, height: 2868 },
    'iPhone 16 Plus': { width: 1290, height: 2796 },
    'iPhone 14 & 15 Pro Max': { width: 1290, height: 2796 },
    'iPhone 14 & 15 Pro': { width: 1179, height: 2556 },
    'iPhone 13 & 14': { width: 1170, height: 2532 },
    Android: { width: 1236, height: 2751 },
  };

  const [wallpaperMode, setWallpaperMode] = useState('gradient');

  const fetchCoverArt = async () => {
    setError('');
    setCoverUrl('');
    setGradientColors([]);

    if (!url) {
      setError('Please enter a Spotify URL');
      return;
    }

    try {
      const response = await axios.post('/api/spotify-cover', { url });
      setCoverUrl(response.data.coverUrl);
      setMainText(response.data.albumName);
    } catch (err) {
      setError('Error fetching cover art. Please check the URL and try again.');
    }
  };

  useEffect(() => {
    if (coverUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = coverUrl;
      img.onload = () => {
        const colorThief = new ColorThief();
        const mainColor = colorThief.getColor(img);
        setGradientColors([mainColor]);

        drawWallpaper(img, mainColor);
      };
    }
  }, [coverUrl, screenSize, coverSize, cornerRadius, coverPosition, wallpaperMode]);

  const drawWallpaper = (img, mainColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const { width: IPHONE_WIDTH, height: IPHONE_HEIGHT } = screenSizes[screenSize];
    canvas.width = IPHONE_WIDTH;
    canvas.height = IPHONE_HEIGHT;

    if (wallpaperMode === 'gradient') {
      // 创建更平滑的渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, IPHONE_HEIGHT);
      const steps = 10; // 增加颜色停止点的数量

      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        let r, g, b;

        if (ratio < 0.5) {
          // 从主色到亮色的过渡
          const lighterColor = lightenColor(mainColor, 30 * ratio);
          [r, g, b] = lighterColor;
        } else {
          // 从亮色到暗色的过渡
          const darkerColor = darkenColor(mainColor, 30 * (ratio - 0.5));
          [r, g, b] = darkerColor;
        }

        gradient.addColorStop(ratio, `rgb(${r}, ${g}, ${b})`);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, IPHONE_WIDTH, IPHONE_HEIGHT);
    } else if (wallpaperMode === 'glassmorphism') {
      // 毛玻璃效果
      ctx.filter = 'blur(200px)';
      const scale = Math.max(IPHONE_WIDTH / img.width, IPHONE_HEIGHT / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (IPHONE_WIDTH - scaledWidth) / 2;
      const offsetY = (IPHONE_HEIGHT - scaledHeight) / 2;

      ctx.save();

      ctx.translate(IPHONE_WIDTH / 2, IPHONE_HEIGHT / 2);

      ctx.rotate(Math.PI);

      ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

      ctx.restore();

      ctx.filter = 'none';

      // 添加黑色透明蒙版
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, IPHONE_WIDTH, IPHONE_HEIGHT);
    }

    // 绘制专辑封面（保持不变）
    const x = (IPHONE_WIDTH - coverSize) / 2;
    const y = coverPosition;

    ctx.save();

    // 创建圆角矩形路径
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + coverSize - cornerRadius, y);
    ctx.quadraticCurveTo(x + coverSize, y, x + coverSize, y + cornerRadius);
    ctx.lineTo(x + coverSize, y + coverSize - cornerRadius);
    ctx.quadraticCurveTo(x + coverSize, y + coverSize, x + coverSize - cornerRadius, y + coverSize);
    ctx.lineTo(x + cornerRadius, y + coverSize);
    ctx.quadraticCurveTo(x, y + coverSize, x, y + coverSize - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.clip();
    ctx.drawImage(img, x, y, coverSize, coverSize);

    ctx.restore();
  };

  // 辅助函数：使颜色变浅
  const lightenColor = (color, amount) => {
    return color.map((c) => Math.min(255, Math.round(c + (255 - c) * (amount / 100))));
  };

  //助函数：使颜色变深
  const darkenColor = (color, amount) => {
    return color.map((c) => Math.max(0, Math.round(c - c * (amount / 100))));
  };

  const downloadWallpaper = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'iphone-wallpaper.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // 2秒后恢复原始状态
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      setError('Failed to copy image to clipboard. Your browser might not support this feature.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-gray-100">
      {/* 左侧面板 */}
      <div className="w-2/3 py-16 px-4 mx-auto overflow-y-auto flex flex-col justify-center gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Get High-Quality Wallpapers from <span className="font-bold text-green-500">Spotify</span> Albums
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Step 1: Navigate to your desired Spotify content page (Choose from{' '}
            <span className="font-bold text-green-500">album, song, artist, podcast, playlist, or podcast episode</span>
            )
            <br />
            Step 2: Obtain the content link <br />
            &nbsp;&nbsp;Option A: In Spotify's web player, simply copy the address bar URL
            <br />
            &nbsp;&nbsp;Option B: Using the Spotify desktop application, right-click the content title, select 'Share',
            then 'Copy Link'
            <br />
            Step 3: Insert the copied link in the field provided below:
          </p>
          <Input
            className="p-4"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Spotify URL"
          />
          <Button onClick={fetchCoverArt}>Generate</Button>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm" role="alert">
              <p>{error}</p>
            </div>
          )}
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
              <label className="block mb-2 text-sm">Cover Size: {coverSize}px</label>
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
              <label className="block mb-2 text-sm">Corner Radius: {cornerRadius}px</label>
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
              <label className="block mb-2 text-sm">Cover Position: {coverPosition}px from top</label>
              <Slider
                min={0}
                max={screenSizes[screenSize].height - coverSize}
                step={10}
                value={[coverPosition]}
                onValueChange={(e) => setCoverPosition(e[0])}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Wallpaper Mode</label>
              <div className="flex gap-4">
                <RadioGroup defaultValue={wallpaperMode} onValueChange={(e) => setWallpaperMode(e)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gradient" id="r1" />
                    <Label htmlFor="r1">Gradient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="glassmorphism" id="r2" />
                    <Label htmlFor="r2">Glassmorphism</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          built with ♥ by{' '}
          <a href="https://bsky.app/profile/william-jin.bsky.social" target="_blank" className="hover:text-green-500">
            @williamjinq
          </a>
          , inspired by{' '}
          <a href="https://www.spotifycover.art/" target="_blank" className="hover:text-green-500">
            spotifycover.art
          </a>
          . <br />
          Checkout the code on{' '}
          <a href="https://github.com/kouyaruten/spotify-wallpaper" target="_blank" className="hover:text-green-500">
            Github
          </a>
        </p>
      </div>

      {/* 右侧面板 */}
      <div className="p-8 flex flex-col items-center justify-center gap-4">
        {coverUrl && (
          <>
            <div className="shadow-2xl rounded-3xl overflow-hidden">
              <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', maxWidth: '390px' }} />
            </div>
            <div className="flex gap-4">
              <Button onClick={downloadWallpaper}>Download Wallpaper</Button>
              <Button
                variant="outline"
                onClick={copyToClipboard}
                disabled={isCopied}
                className={isCopied ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
              >
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IPhoneWallpaper;
