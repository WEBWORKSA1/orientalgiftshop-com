/* OrientalGiftShop.com settings. Edit values here; no other file needs to change. */
window.OGS_CONFIG = {
  /* Form inbox, stored encoded. Decoded only at the moment a form is sent. Do not replace with plain text. */
  inbox: [122, 120, 116, 57, 123, 126, 118, 122, 112, 87, 38, 118, 100, 124, 101, 120, 96, 117, 114, 96],
  formEndpoint: "https://formsubmit.co/ajax/",

  /* AdSense display-unit slot IDs. Leave blank until approved; Auto ads work without them. */
  adSlots: { "in-content": "", "sidebar": "", "home-mid": "", "tool-result": "" },

  /* Payment links for the Support page. When blank, the page collects a pledge and you reply with a link. */
  donate: {
    paypal: "",        /* e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX */
    stripe: "",        /* e.g. https://buy.stripe.com/XXXX (one-time) */
    stripeMonthly: "", /* e.g. https://buy.stripe.com/YYYY (subscription) */
    bmc: ""            /* e.g. https://buymeacoffee.com/yourname */
  },

  /* Affiliate tracking. When set, "Find it" links on gift ideas use these instead of plain search links.
     Use {q} where the search phrase should go. */
  affiliates: {
    amazon: "",  /* e.g. https://www.amazon.com/s?k={q}&tag=YOURTAG-20 */
    etsy: ""     /* e.g. your Awin/Etsy affiliate deep link with {q} */
  },

  /* Contest settings shown on the Contests page. */
  contest: {
    name: "Year of the Goat Gift Story Contest",
    prize: "US$100 gift card of the winner's choice",
    runnerUp: "Two runners-up win a US$25 gift card and a feature on the site",
    closes: "2027-02-20",
    sponsor: ""
  },

  /* Show the floating "Need 10+ gifts?" bar after the visitor scrolls 40% of a page. */
  stickyLead: true,
  cookieNotice: true
};
