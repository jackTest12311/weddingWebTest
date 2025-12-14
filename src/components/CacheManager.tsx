"use client";

import { useEffect, useRef } from "react";
import APP_VERSION from "../config/version";

const STORAGE_KEY = "wedding_app_version";
const PRESERVE_KEYS = ["wedding_guest_book", "wedding_attendance"] as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getSafeLocalStorage(): Storage | null {
  if (!isBrowser()) return null;

  try {
    // 반드시 window.localStorage를 기준으로 확인
    const ls = window.localStorage;

    // 일부 환경(특히 dev/툴/폴리필)에서 localStorage 형태가 깨진 경우 방어
    if (!ls) return null;
    if (typeof ls.getItem !== "function") return null;
    if (typeof ls.setItem !== "function") return null;
    if (typeof ls.clear !== "function") return null;

    // 실제로 접근 가능한지 한 번 더 체크(사파리 프라이빗 등)
    const testKey = "__ls_test__";
    ls.setItem(testKey, "1");
    ls.removeItem(testKey);

    return ls;
  } catch {
    return null;
  }
}

async function clearServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch {}
}

async function clearCacheStorage() {
  if (!("caches" in window)) return;
  try {
    // @ts-ignore - caches 타입은 브라우저 환경에서만
    const names: string[] = await window.caches.keys();
    // @ts-ignore
    await Promise.all(names.map((n) => window.caches.delete(n)));
  } catch {}
}

export default function CacheManager() {
  const runningRef = useRef(false);

  useEffect(() => {
    // SSR 방지
    if (!isBrowser()) return;

    const checkVersion = async () => {
      if (runningRef.current) return;
      runningRef.current = true;

      try {
        const ls = getSafeLocalStorage();
        if (!ls) return;

        const currentVersion = APP_VERSION?.version ?? "";
        if (!currentVersion) return;

        const storedVersion = ls.getItem(STORAGE_KEY);

        // 최초 실행: 버전 저장만
        if (!storedVersion) {
          ls.setItem(STORAGE_KEY, currentVersion);
          return;
        }

        // 동일하면 종료
        if (storedVersion === currentVersion) return;

        // --- 버전 변경 감지: 캐시 정리 ---
        // 보존할 값 백업
        const preserved: Record<string, string> = {};
        for (const key of PRESERVE_KEYS) {
          const v = ls.getItem(key);
          if (v != null) preserved[key] = v;
        }

        // localStorage clear 후 복원
        ls.clear();
        for (const [k, v] of Object.entries(preserved)) {
          ls.setItem(k, v);
        }

        // sessionStorage 정리(가능할 때만)
        try {
          const ss = window.sessionStorage;
          if (ss && typeof ss.clear === "function") ss.clear();
        } catch {}

        // SW + CacheStorage 정리
        await clearServiceWorkers();
        await clearCacheStorage();

        // 새 버전 기록
        ls.setItem(STORAGE_KEY, currentVersion);

        // 새로고침(너무 즉시 하면 꼬이는 경우가 있어 약간 딜레이)
        window.setTimeout(() => {
          window.location.reload();
        }, 300);
      } catch (err) {
        console.error("[CacheManager] Version check failed:", err);
      } finally {
        runningRef.current = false;
      }
    };

    // 최초 1회 실행
    checkVersion();

    // 주기 실행
    const intervalId = window.setInterval(checkVersion, 5 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}