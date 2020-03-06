import * as React from "react";
import { Link, Redirect }  from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import {
  Footer,
} from "~/src/components"
import {
  ApplicationState,
} from "~/src/common";

export default function UserPage({ match }) {
  const { user, token } = useSelector<ApplicationState>(state => state);
  const { t } = useTranslation();

  if (user) {
    return <Redirect to="/"/>
  }

  return <div>Landing</div>;
}
