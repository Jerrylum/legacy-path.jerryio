import { makeAutoObservable, intercept } from "mobx";
import { AppThemeType } from "../app/Theme";
import { LayoutType } from "./Layout";

export class Preferences {
  private disposers: (() => void)[] = []; // intercept() disposer

  // Local storage
  public maxHistory: number = 50;
  public isGoogleAnalyticsEnabled: boolean = false;
  public themeType: AppThemeType = AppThemeType.Dark;
  public layoutType: LayoutType = LayoutType.Classic;

  // Not in local storage
  public isSpeedCanvasVisible: boolean = true; // In classic layout only
  public isRightPanelVisible: boolean = true; // In classic layout only

  constructor() {
    makeAutoObservable(this);

    this.linkLocalStorage();
    window.addEventListener("storage", () => this.linkLocalStorage());
  }

  private link(key: keyof this, storageKey: string) {
    const item = localStorage.getItem(storageKey);
    if (item !== null) {
      try {
        this[key] = JSON.parse(item);
      } catch (e) {
        this[key] = item as any; // ALGO: Legacy string support
      }
    }

    // ALGO: intercept() invokes the callback even if the value is the same
    return intercept(this, key, change => {
      localStorage.setItem(storageKey, JSON.stringify(change.newValue));
      return change;
    });
  }

  private linkLocalStorage() {
    this.disposers.forEach(disposer => disposer());
    this.disposers = [
      this.link("maxHistory", "maxHistory"),
      this.link("isGoogleAnalyticsEnabled", "googleAnalyticsEnabled"),
      this.link("themeType", "theme"),
      this.link("layoutType", "layout")
    ];
  }
}
