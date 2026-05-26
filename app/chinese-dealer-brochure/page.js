import ChineseDealerBrochure from "../../components/ChineseDealerBrochure";

export const metadata = {
  title: "Chinese Dealer Brochure",
  description: "Editable A4 vehicle brochure page for Chinese dealer sharing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChineseDealerBrochurePage() {
  return <ChineseDealerBrochure />;
}
