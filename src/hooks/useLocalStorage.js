import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
  // 添加一个状态来跟踪组件是否已经挂载
  const [isMounted, setIsMounted] = useState(false);

  // 使用 useState 来存储值，初始值设为 initialValue
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    setIsMounted(true);
    // 在组件挂载后，尝试从 localStorage 中读取值
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        setStoredValue(JSON.parse(item));
      } catch (error) {
        console.log(error);
      }
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 只有在组件挂载后才返回实际的存储值，否则返回初始值
  return [isMounted ? storedValue : initialValue, setValue];
}

export default useLocalStorage;
