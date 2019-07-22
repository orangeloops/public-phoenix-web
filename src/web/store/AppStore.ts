import localforage from "localforage";
import {DataStore} from "../../services";
import {action, computed, observable} from "mobx";

export enum Breakpoint {
  XS = 575,
  SM = 768,
  MD = 992,
  LG = 1200,
  XL = 1600,
  XXL = 1601,
}

export class AppStore {
  store = new DataStore();

  @observable
  protected windowWidth: number = window.innerWidth;

  constructor() {
    window.addEventListener("resize", this.handleWindowResize);
  }

  @computed
  get breakpoint(): Breakpoint {
    const {windowWidth} = this;

    if (windowWidth <= Breakpoint.XS) return Breakpoint.XS;
    else if (windowWidth <= Breakpoint.SM) return Breakpoint.SM;
    else if (windowWidth <= Breakpoint.MD) return Breakpoint.MD;
    else if (windowWidth <= Breakpoint.LG) return Breakpoint.LG;
    else if (windowWidth <= Breakpoint.XL) return Breakpoint.XL;
    else return Breakpoint.XXL;
  }

  @action.bound
  private handleWindowResize() {
    this.windowWidth = window.innerWidth;
  }

  logOut = () => {
    this.store.signOut();
    localStorage.removeItem("token");
    localforage.removeItem("ph-logInInfo");
  };

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  setToken(token: string) {
    return localStorage.setItem("token", token);
  }

  deleteToken() {
    return localStorage.removeItem("token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  setRefreshToken(refreshToken: string) {
    return localStorage.setItem("refreshToken", refreshToken);
  }

  deleteRefreshToken() {
    return localStorage.removeItem("refreshToken");
  }
}
