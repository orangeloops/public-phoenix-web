import * as React from "react";
import {DataStore} from "../services";
import {AppStore} from "./store/AppStore";

export interface BaseComponentProps {}

export interface BaseComponentState {}

export abstract class BaseComponent<P extends BaseComponentProps = BaseComponentProps, S extends BaseComponentState = BaseComponentState> extends React.Component<P, S> {
  state = {} as S;

  protected store = new DataStore();
  protected appStore = new AppStore();
}
