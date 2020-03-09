import * as React from "react";
import { Redirect }  from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import {
  Footer,
} from "~/src/components"
import {
  ApplicationState,
} from "~/src/common";

export default function UserPage({ match }) {
  const { user } = useSelector<ApplicationState>(state => state);
  const { t } = useTranslation();

  if (user) {
    return <Redirect to="/"/>
  }

  const title = "Built for people";
  const subtitle = "Fragio is kanban board, from personal to business, make your life easier.";

  const listTitle = "To-Do";
  const cards = [
    {
      name: t("landing.card1"),
      labels: [
        {
          name: "Social",
          color: 0x4ED8D8,
        },
        {
          name: "Marketing",
          color: 0xD84E7C,
        },
      ],
    },
    {
      name: t("landing.card2"),
      labels: [
        {
          name: "Backend",
          color: 0x33A594,
        },
        {
          name: "Frontend",
          color: 0xD8AF4E,
        },
        {
          name: "React",
          color: 0x3A85B7,
        },
      ],
    },
    {
      name: t("landing.card3"),
      labels: [
        {
          name: "Backend",
          color: 0x33A594,
        },
      ],
    },
  ];

  return (
    <div className="h-100">
      <div className="bg-dark h-75 w-100 mw-100 mh-75">
        <div className="container h-100 d-flex flex-column flex-lg-row align-items-center justify-content-center">
          <div className="text-wrap">
            <h1 className="text-white ">{title}</h1>
            <h3 className="text-white-50">{subtitle}</h3>
          </div>
          <div className="d-flex d-lg-none card shadow mt-4 h-50 w-100">
            <div className="card-header px-2">
              <b>{listTitle}</b>
            </div>
            <div className="card-body bg-light overflow-auto p-2 pb-0">
              {cards.map(card =>
                <div className="card shadow-sm mb-3">
                  <div className="card-body p-2">
                    {card.labels.length > 0 &&
                      <div>
                        {card.labels.map(label =>
                          <span
                            className="badge badge-secondary mr-2 mb-2"
                            style={{backgroundColor: `#${label.color.toString(16)}`}}>
                            {label.name}
                          </span>
                        )}
                      </div>
                    }
                    <p className="card-text">
                      {card.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="d-none d-lg-flex card shadow ml-4 h-75 w-50">
            <div className="card-header px-2">
              <b>{listTitle}</b>
            </div>
            <div className="card-body bg-light overflow-auto p-2 pb-0">
              {cards.map(card =>
                <div className="card shadow-sm mb-3">
                  <div className="card-body p-2">
                    {card.labels.length > 0 &&
                      <div>
                        {card.labels.map(label =>
                          <span
                            className="badge badge-secondary mr-2 mb-2"
                            style={{backgroundColor: `#${label.color.toString(16)}`}}>
                            {label.name}
                          </span>
                        )}
                      </div>
                    }
                    <p className="card-text">
                      {card.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <Footer/>
      </div>
    </div>
  );
}
