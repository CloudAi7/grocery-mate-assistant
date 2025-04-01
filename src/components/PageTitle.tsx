
import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-grocery-primary">{title}</h1>
      {subtitle && <p className="text-grocery-text/70 mt-2">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;
