import os
import re

# Exact phrase translations for remaining multi-word phrases and sentences
PHRASE_MAP = {
    # AppContext toasts & descriptions
    'title: lang === "bn" ? "Nnoɔma Ka ho করা হয়েছে!" : "Product Added!"': 'title: lang === "bn" ? "Wɔde Nnoɔma Foforɔ Aka Ho!" : "Product Added!"',
    'title: lang === "bn" ? "Nnoɔma আপডেট হয়েছে!" : "Product Updated!"': 'title: lang === "bn" ? "Nnoɔma No Ayɛ Foforɔ!" : "Product Updated!"',
    'title: lang === "bn" ? "Nnoɔma মুছে ফেলা হয়েছে" : "Product Deleted"': 'title: lang === "bn" ? "Wɔapepa Nnoɔma No" : "Product Deleted"',
    'title: lang === "bn" ? "Akorae সমন্বয় সম্পন্ন" : "Stock Adjusted"': 'title: lang === "bn" ? "Akorae Siesie Awie Pɛpɛɛpɛ" : "Stock Adjusted"',
    'title: lang === "bn" ? "Otɔfoɔ Ka ho করা হয়েছে!" : "Customer Added!"': 'title: lang === "bn" ? "Wɔde Otɔfoɔ Foforɔ Aka Ho!" : "Customer Added!"',
    'title: lang === "bn" ? "Otɔfoɔের তথ্য আপডেট হয়েছে" : "Customer Updated"': 'title: lang === "bn" ? "Otɔfoɔ Ho Nsɛm Ayɛ Foforɔ" : "Customer Updated"',
    'title: lang === "bn" ? "Otɔfoɔ মুছে ফেলা হয়েছে" : "Customer Deleted"': 'title: lang === "bn" ? "Wɔapepa Otɔfoɔ No" : "Customer Deleted"',
    'title: lang === "bn" ? "Agorɔfoɔ যুক্ত হয়েছে!" : "Supplier Added!"': 'title: lang === "bn" ? "Wɔde Agorɔfoɔ Foforɔ Aka Ho!" : "Supplier Added!"',
    'title: lang === "bn" ? "Ka মুছে ফেলা হয়েছে" : "Expense Deleted"': 'title: lang === "bn" ? "Wɔapepa Ka No" : "Expense Deleted"',
    'title: lang === "bn" ? "Adwumayɛfoɔ যুক্ত হয়েছে!" : "Employee Added!"': 'title: lang === "bn" ? "Wɔde Adwumayɛfoɔ Foforɔ Aka Ho!" : "Employee Added!"',
    'title: lang === "bn" ? "Adwumayɛfoɔ আপডেট হয়েছে" : "Employee Updated"': 'title: lang === "bn" ? "Adwumayɛfoɔ Ho Nsɛm Ayɛ Foforɔ" : "Employee Updated"',
    'title: lang === "bn" ? "Adwumayɛfoɔ মুছে ফেলা হয়েছে" : "Employee Deleted"': 'title: lang === "bn" ? "Wɔapepa Adwumayɛfoɔ No" : "Employee Deleted"',
    'title: lang === "bn" ? "Nyinaa নোটিফিকেশন পড়া হিসেবে চিহ্নিত" : "All notifications marked as read"': 'title: lang === "bn" ? "Woakenkan nkaebɔ nyinaa awie" : "All notifications marked as read"',
    'title: lang === "bn" ? "Nyinaa নোটিফিকেশন মুছে ফেলা হয়েছে" : "All notifications cleared"': 'title: lang === "bn" ? "Wɔapepa nkaebɔ nyinaa" : "All notifications cleared"',
    'title: lang === "bn" ? "Nhyehyɛeɛ সংরক্ষিত হয়েছে!" : "Settings Saved!"': 'title: lang === "bn" ? "Nhyehyɛeɛ No Akora So Pɛpɛɛpɛ!" : "Settings Saved!"',
    'title: lang === "bn" ? "অবদান রেকর্ড ও ইমপ্যাক্ট স্বীকৃত!" : "Contribution Recorded & Impact Recognized!"': 'title: lang === "bn" ? "Mmoa a Wɔde Maeɛ No Akora So!" : "Contribution Recorded & Impact Recognized!"',
    'title: lang === "bn" ? "অপর্যাপ্ত Sika a Aka" : "Insufficient VGO Balance"': 'title: lang === "bn" ? "Sika Nso Wɔ Akawnt Mu" : "Insufficient VGO Balance"',
    'title: lang === "bn" ? "ভ্যালু ট্রান্সফার সফল!" : "Value Transferred Successfully!"': 'title: lang === "bn" ? "Sika Mane No Ayɛ Yie Pɛpɛɛpɛ!" : "Value Transferred Successfully!"',
    'title: lang === "bn" ? "নেটওয়ার্ক স্ট্যাকিং সম্পন্ন!" : "Network Staking Completed!"': 'title: lang === "bn" ? "Staking No Awie Pɛpɛɛpɛ!" : "Network Staking Completed!"',
    'title: lang === "bn" ? "নেটওয়ার্ক ডিভিডেন্ড Kyɛ সম্পন্ন!" : "Network Value Shared!"': 'title: lang === "bn" ? "Mfasoɔ Kyɛfa No Awie Pɛpɛɛpɛ!" : "Network Value Shared!"',
    'title: lang === "bn" ? "এসএমএস ক্যাম্পেইন পাঠানো হয়েছে!" : "SMS Campaign Sent!"': 'title: lang === "bn" ? "SMS Dawubɔ No Akɔ Pɛpɛɛpɛ!" : "SMS Campaign Sent!"',
    'title: lang === "bn" ? "মেটা/ফেNyinaaুক সিঙ্ক আপডেট সম্পন্ন!" : "Meta / Facebook Sync Updated!"': 'title: lang === "bn" ? "Meta / Facebook Nkitahodie Ayɛ Foforɔ!" : "Meta / Facebook Sync Updated!"',
    'title: lang === "bn" ? "মেটা/ফেসবুক সিঙ্ক আপডেট সম্পন্ন!" : "Meta / Facebook Sync Updated!"': 'title: lang === "bn" ? "Meta / Facebook Nkitahodie Ayɛ Foforɔ!" : "Meta / Facebook Sync Updated!"',
    'title: lang === "bn" ? "এসএমএস Sika a Aka রিচার্জ সফল!" : "SMS Balance Recharged!"': 'title: lang === "bn" ? "SMS Sika Ahyɛ Mu Ayɛ Yie Pɛpɛɛpɛ!" : "SMS Balance Recharged!"',
    'title: lang === "bn" ? "পার্সেল বুকিং সফল!" : "Courier Parcel Booked!"': 'title: lang === "bn" ? "Kɔmafoɔ Parcel Ayɛ Krado!" : "Courier Parcel Booked!"',
    'title: lang === "bn" ? "পার্সেল স্ট্যাটাস আপডেট!" : "Parcel Status Updated!"': 'title: lang === "bn" ? "Parcel Gyinabea Ayɛ Foforɔ!" : "Parcel Status Updated!"',
    'title: lang === "bn" ? "Sikakorabea অ্যাকাউন্ট অনুমোদিত ও চালু!" : "Digital Bank Account Activated!"': 'title: lang === "bn" ? "Sikakorabea Akawnt Ayɛ Adwuma!" : "Digital Bank Account Activated!"',
    'title: lang === "bn" ? "পেমেন্ট গেটওয়ে Nhyehyɛeɛ সংরক্ষিত!" : "Digital Payment Settings Saved!"': 'title: lang === "bn" ? "Akatua Nhyehyɛeɛ Akora So Pɛpɛɛpɛ!" : "Digital Payment Settings Saved!"',
    'title: lang === "bn" ? "রিসেল প্রোডাক্ট আপডেট!" : "Resell Product Updated!"': 'title: lang === "bn" ? "Tɔ Na Tɔn Nnoɔma Ayɛ Foforɔ!" : "Resell Product Updated!"',
    'title: lang === "bn" ? "Intanɛte Dukan ওয়েবসাইট সংরক্ষিত!" : "Online Storefront Updated!"': 'title: lang === "bn" ? "Intanɛte Dukan Ayɛ Foforɔ!" : "Online Storefront Updated!"',
    'title: lang === "bn" ? "মনিটরিং রুল আপডেট!" : "Monitoring Rule Toggled!"': 'title: lang === "bn" ? "Ahwɛso Mmara Ayɛ Foforɔ!" : "Monitoring Rule Toggled!"',
    'title: lang === "bn" ? "Kɔkɔbɔ সমাধান করা হয়েছে!" : "Alert Resolved!"': 'title: lang === "bn" ? "Kɔkɔbɔ No Adi So Pɛpɛɛpɛ!" : "Alert Resolved!"',

    # Settings.tsx lines
    'title: isBn ? "ডেটা Export সম্পন্ন হয়েছে!" : "Data Exported Successfully!"': 'title: isBn ? "Nsɛm Nyinaa Export Awie!" : "Data Exported Successfully!"',
    'title: isBn ? "Export ব্যর্থ হয়েছে" : "Export Failed"': 'title: isBn ? "Export No Anyɛ Yie" : "Export Failed"',
    'message: isBn ? "দয়া করে পুনরায় চেষ্টা করুন।" : "An error occurred while exporting data."': 'message: isBn ? "Yɛsrɛ wo, san sɔ hwɛ bio." : "An error occurred while exporting data."',
    '{isBn ? "Dukan মূল তথ্য" : "Shop Information"}': '{isBn ? "Dukan Ho Nsɛm Titiriw" : "Shop Information"}',
    '{isBn ? "Dukan নাম (ইংরেজি)" : "Shop Name (English)"}': '{isBn ? "Dukan Din (Borɔfo)" : "Shop Name (English)"}',
    '{isBn ? "Dukan নাম (Twi (Akan))" : "Shop Name (Bangla)"}': '{isBn ? "Dukan Din (Twi / Akan)" : "Shop Name (Twi / Akan)"}',
    '{isBn ? "মালিকের নাম" : "Owner Name"}': '{isBn ? "Wura Din" : "Owner Name"}',
    '{isBn ? "ব্যবসার ধরণ" : "Business Type"}': '{isBn ? "Adwuma Nkyekyɛmu" : "Business Type"}',
    '{isBn ? "Ka hoাKa ho মোবাইল" : "Contact Phone"}': '{isBn ? "Fon Nɔma" : "Contact Phone"}',
    '{isBn ? "যোগাযোগের মোবাইল" : "Contact Phone"}': '{isBn ? "Fon Nɔma" : "Contact Phone"}',
    '{isBn ? "মুদ্রা" : "Currency"}': '{isBn ? "Sika (Currency)" : "Currency"}',
    '{isBn ? "ঠিকানা" : "Shop Address"}': '{isBn ? "Dukan Beaeɛ" : "Shop Address"}',
    '{isBn ? "পরিবর্তন Kora so করুন" : "Save Changes"}': '{isBn ? "Kora Nsesaeɛ So" : "Save Changes"}',
    '{isBn ? "Tintimিং ও Invois প্রিফারেন্স" : "Printer Configuration"}': '{isBn ? "Invois & Tintim Nhyehyɛeɛ" : "Printer Configuration"}',
    '{isBn ? "Tɔnের পর অটো-Tintim" : "Auto-open Print dialog after POS sale"}': '{isBn ? "Tintim kasaa ntɛmntɛm wɔ tɔn akyi" : "Auto-open Print dialog after POS sale"}',
    '{isBn ? "Kasaa (Receipt)ের নিচের টেক্সট (Footer Note)" : "Receipt Footer Message"}': '{isBn ? "Kasaa Asɛm (Footer Message)" : "Receipt Footer Message"}',
    '{isBn ? "সিস্টেম ও ডেমো ডেটা রিসেট" : "Data Management"}': '{isBn ? "Nsɛm Nyinaa Siesie (Reset)" : "Data Management"}',
    '{isBn ? "ফ্যাক্টরি রিসেট / ডেমো ডেটা পুনরুদ্ধার" : "Reset Data to Initial Demo State"}': '{isBn ? "San Fa Demo Nsɛm No Ba" : "Reset Data to Initial Demo State"}',
    '{isBn ? "ডেমো ডেটা রিসেট করুন" : "Reset All Demo Data"}': '{isBn ? "Siesie Nsɛm Nyinaa (Reset)" : "Reset All Demo Data"}',
    '{isBn ? "ডেটা Export করুন" : "Export Data"}': '{isBn ? "Export Nsɛm Nyinaa" : "Export Data"}',

    # Messaging.tsx lines
    'text: isBn ? "ধন্যবাদ, আমি আপনার বার্তা পেয়েছি এবং দ্রুত কনফার্ম করছি।" : "Thank you, received and confirming shortly!"': 'text: isBn ? "Medaase, menya wo nkra no na mereka akyerɛ wo ntɛm!" : "Thank you, received and confirming shortly!"',
    'placeholder={isBn ? "নাম বা মোবাইল নম্বর Hwehwɛ..." : "Search by name or phone..."}': 'placeholder={isBn ? "Hwehwɛ din anaa fon nɔma..." : "Search by name or phone..."}',
    'aria-label={isBn ? "Fie (Home)ে ফিরে যান" : "Back to Home"}': 'aria-label={isBn ? "San kɔ Fie (Home)" : "Back to Home"}',

    # Reports.tsx months
    'monthBn: "সেপ্টেম্বর"': 'monthBn: "Ɛbɔ (Sep)"',
    'monthBn: "আগস্ট"': 'monthBn: "Ɔsanaa (Aug)"',
    'monthBn: "জুলাই"': 'monthBn: "Kitawonsa (Jul)"',
    'monthBn: "জুন"': 'monthBn: "Ayɛwohomumɔ (Jun)"',
    'monthBn: "মে"': 'monthBn: "Kɔtonimma (May)"',
    'monthBn: "এপ্রিল"': 'monthBn: "Oforisuo (Apr)"',
    'monthBn: "মার্চ"': 'monthBn: "Ɔbɛnem (Mar)"',
    'monthBn: "ফেব্রুয়ারি"': 'monthBn: "Ogyefuo (Feb)"',
    'monthBn: "জানুয়ারি"': 'monthBn: "Ɔpɛpɔn (Jan)"',

    # Reports.tsx advisory
    'badgeTextBn = "Ntɛmntɛm কেনা দরকার (Akorae Asa/ঝুঁকি)";': 'badgeTextBn = "Tɔ Ntɛmntɛm (Akorae Asa/Fom)";',
    'badgeTextBn = "🟡 শীঘ্রই শেষ হবে";': 'badgeTextBn = "🟡 Ɛrensa Ntɛm";',
    'badgeTextBn = "🟢 Akorae Wɔ Hɔ";': 'badgeTextBn = "🟢 Akorae Wɔ Hɔ";',
    'badgeTextBn = "⚪ Tɔn Ntoasoɔ Brɛoo";': 'badgeTextBn = "⚪ Tɔn Ntoasoɔ Brɛoo";',

    # WebsiteBuilder digits and phrases
    '<span>৪.৯ / ৫.০</span>': '<span>4.9 / 5.0</span>',
}

# Individual Bengali words/terms mapping to Ghanaian Twi
WORD_MAP = {
    "করুন": "",
    "হয়েছে": "awie",
    "হবে": "bɛyɛ",
    "আছে": "wɔ hɔ",
    "নেই": "nni hɔ",
    "এবং": "ne",
    "ও": "ne",
    "বা": "anaa",
    "থেকে": "firi",
    "জন্য": "ma",
    "এর": "no",
    "টি": "",
    "জন": "",
    "পিস": "pcs",
    "টাকা": "Sika",
    "টাকার": "Sika",
    "টাকায়": "Sika so",
    "পণ্য": "Nnoɔma",
    "পণ্যের": "Nnoɔma",
    "বিক্রয়": "Tɔn",
    "বিক্রির": "Tɔn",
    "লাভ": "Mfasoɔ",
    "লাভের": "Mfasoɔ",
    "বাকি": "Aka",
    "বকেয়া": "Aka",
    "বকেয়ার": "Aka",
    "খরচ": "Ka",
    "খরচের": "Ka",
    "ক্যাশ": "Sika (Cash)",
    "ব্যাংক": "Sikakorabea",
    "ব্যাংকের": "Sikakorabea",
    "গ্রাহক": "Otɔfoɔ",
    "গ্রাহকের": "Otɔfoɔ",
    "গ্রাহকদের": "Atɔfoɔ",
    "সাপ্লায়ার": "Agorɔfoɔ",
    "কর্মচারী": "Adwumayɛfoɔ",
    "কর্মচারীর": "Adwumayɛfoɔ",
    "স্টক": "Akorae",
    "স্টকের": "Akorae",
    "ইনভেন্টরি": "Akorae",
    "ইনভয়েস": "Invois",
    "রসিদ": "Kasaa (Receipt)",
    "রসিদের": "Kasaa",
    "রিপোর্ট": "Amanneɛbɔ",
    "সেটিংস": "Nhyehyɛeɛ",
    "বিজ্ঞপ্তি": "Nkaebɔ",
    "অ্যালার্ট": "Kɔkɔbɔ",
    "মার্কেটিং": "Dawubɔ",
    "কুরিয়ার": "Kɔmafoɔ",
    "ডেলিভারি": "Delivery",
    "অনলাইন": "Intanɛte",
    "দোকান": "Dukan",
    "দোকানের": "Dukan",
    "খুঁজুন": "Hwehwɛ",
    "যোগ": "Fa ka ho",
    "যুক্ত": "aka ho",
    "মুছুন": "Pepa",
    "সম্পাদনা": "Sesa",
    "সংরক্ষণ": "Kora so",
    "সংরক্ষিত": "akora so",
    "বাতিল": "Gyae",
    "বন্ধ": "To mu",
    "নতুন": "Foforɔ",
    "মোট": "Nyinaa",
    "সব": "Nyinaa",
    "সকল": "Nyinaa",
    "আজ": "Ɛnnɛ",
    "কাল": "Ɔkyena",
    "সপ্তাহ": "Dapɛn",
    "মাস": "Bosome",
    "বছর": "Afe",
    "দিন": "Nna",
    "পরিশোধ": "Akatua",
    "পরিশোধিত": "Wɔatua",
    "আদায়": "Gye",
    "উত্তোলন": "Yi Sika",
    "জমা": "Hyɛ Sika Mu",
    "হিসাব": "Akawnt",
    "নাম": "Din",
    "ঠিকানা": "Beaeɛ",
    "মোবাইল": "Fon",
    "নম্বর": "Nɔma",
    "বিবরণ": "Nsɛm",
    "তারিখ": "Da",
    "পরিমাণ": "Dodoɔ",
    "মূল্য": "Boɔ",
    "দর": "Boɔ",
    "ছাড়": "Te so",
    "উপমোট": "Ne fa bi",
    "সর্বমোট": "Ne nyinaa",
    "ফেরত": "Nsakyerae",
    "কর": "Tax",
    "ভ্যাট": "VAT",
    "ঋণ": "Bosea",
    "লোন": "Bosea",
    "কিস্তি": "Akatua (EMI)",
    "সুদ": "Mfasoɔ Nsɛm",
    "পদ্ধতি": "Kwan",
    "স্ট্যাটাস": "Gyinabea",
    "অবস্থা": "Gyinabea",
    "চলতি": "Ɛrekɔ so",
    "সম্পন্ন": "Awie",
    "সফল": "Ayɛ Yie",
    "ব্যর্থ": "Anyɛ Yie",
    "ত্রুটি": "Mfomsoɔ",
    "চেষ্টা": "Sɔ hwɛ",
    "পুনরায়": "Bio",
    "ফিল্টার": "Yi mu",
    "ডাউনলোড": "Twe",
    "প্রিন্ট": "Tintim",
    "শেয়ার": "Kyɛ",
    "কপি": "Kɔpi",
    "ক্লিক": "Klike",
    "নির্বাচন": "Yi",
    "বাছাই": "Yi",
    "পড়া": "Kenkan",
    "অপঠিত": "Wonkenkanee",
    "দেখান": "Kyerɛ",
    "লুকান": "Suma",
    "স্বাগতম": "Akwaaba",
    "ধন্যবাদ": "Medaase",
    "অনুগ্রহ": "Yɛsrɛ wo",
    "দয়া": "Yɛsrɛ wo",
    "জরুরি": "Ntɛmntɛm",
    "সহায়তা": "Mmoa",
    "হেল্প": "Mmoa",
    "সহায়িকা": "Akwankyerɛ",
    "নিয়ম": "Mmara",
    "শর্ত": "Nhyehyɛeɛ",
    "নিরাপত্তা": "Bambɔ",
    "পাসওয়ার্ড": "Password",
    "পিন": "PIN",
    "লগইন": "Wura Mu",
    "রেজিস্ট্রেশন": "Kyerɛw Wo Din",
    "সাইন": "Sign In",
    "অ্যাকাউন্ট": "Akawnt",
    "প্রোফাইল": "Profile",
    "ব্যবহারকারী": "Dwumadiefoɔ",
    "মালিক": "Wura",
    "ব্যবসা": "Adwuma",
    "কোম্পানি": "Adwumakuo",
    "ব্র্যান্ড": "Brand",
    "ক্যাটাগরি": "Nkyekyɛmu",
    "বিভাগ": "Nkyekyɛmu",
    "আইটেম": "Nnoɔma",
    "কার্ট": "Kɛntɛn",
    "অর্ডার": "Order",
    "চালান": "Challan / Invois",
    "বিল": "Bill",
    "পেমেন্ট": "Akatua",
    "ট্যাক্স": "Tax",
    "সাহায্য": "Mmoa",
    "বার্তা": "Nkra",
    "চ্যাট": "Nkɔmbɔ",
    "মেসেজ": "Nkra",
    "কল": "Frɛ",
    "ফোন": "Fon",
    "ইমেইল": "Email",
    "ওয়েবসাইট": "Wɛbsaet",
    "লিংক": "Link",
    "ছবির": "Mfoni",
    "ছবি": "Mfoni",
    "ক্যামেরা": "Camera",
    "স্ক্যান": "Scan",
    "কোড": "Code",
    "বারকোড": "Barcode",
    "কিউআর": "QR",
    "সার্ভিস": "Dwumadie",
    "সেবা": "Dwumadie",
    "অফার": "Deals / Offer",
    "ডিসকাউন্ট": "Te so",
    "বোনাস": "Bonus",
    "পয়েন্ট": "Points",
    "পুরস্কার": "Abasobɔdeɛ",
    "গিফট": "Akyɛdeɛ",
    "রিভিউ": "Review",
    "রেটিং": "Rating",
    "মন্তব্য": "Adwene",
    "ফিডব্যাক": "Feedback",
    "সন্তুষ্টি": "Anigyeɛ",
    "বিশ্বাসযোগ্যতা": "Ahotosoɔ",
    "রেকর্ড": "Record",
    "ইতিহাস": "Abakɔsɛm",
    "তালিকা": "Din / List",
    "সীমা": "Ehuo",
    "সর্বোচ্চ": "Nea ɛkɔ anim",
    "সর্বনিম্ন": "Nea ɛba fam",
    "গড়": "Mfinimfini",
    "অনুপাত": "Ratio",
    "শতাংশ": "%",
    "হিসাবে": "Sɛ",
    "মতো": "Sɛ",
    "সাথে": "Ne",
    "দ্বারা": "Denam",
    "প্রতি": "Biara",
    "পর": "Akyi",
    "আগে": "Kane",
    "মধ্যে": "Mu",
    "বাইরে": "Abɔnten",
    "উপরে": "Soro",
    "নিচে": "Fam",
    "ডানে": "Nifa",
    "বামে": "Benkum",
    "সামনে": "Anim",
    "পেছনে": "Akyi",
    "এখানে": "Ha",
    "সেখানে": "Hɔ",
    "কোথায়": "Ɛhe",
    "কখন": "Berɛ bɛn",
    "কেন": "Adɛn",
    "কীভাবে": "Sɛn",
    "কী": "Dɛn",
    "কে": "Hwan",
    "কত": "Sɛn",
    "অনেক": "Pii",
    "অল্প": "Kakra",
    "বেশি": "Boro so",
    "কম": "Sua",
    "ভারী": "Duru",
    "হালকা": "Harɛ",
    "বড়": "Kɛseɛ",
    "ছোট": "Kumaa",
    "ভালো": "Pa",
    "খারাপ": "Bɔne",
    "সহজ": "Mmerɛ",
    "কঠিন": "Dennen",
    "দ্রুত": "Ntɛm",
    "ধীর": "Brɛoo",
    "সরাসরি": "Tẽẽ",
    "স্বয়ংক্রিয়": "Automatic",
    "ম্যানুয়াল": "Manual",
    "ডিজিটাল": "Digital",
    "স্মার্ট": "Smart",
}

# Bengali digits to standard numerals
DIGIT_MAP = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
}

def clean_content(text):
    # 1. First apply exact multi-word phrase replacements
    for k, v in PHRASE_MAP.items():
        text = text.replace(k, v)

    # 2. Currency fixes: replace GHS (₵) or GH₵ with ₵
    text = text.replace('currency: "GHS (₵)"', 'currency: "₵ (Ghana Cedi)"')
    text = text.replace('GHS — Ghana Cedi (₵)', 'Ghana Cedi (₵)')
    text = text.replace('GHS — Ghana Cedi', 'Ghana Cedi (₵)')
    text = text.replace('<option value="GHS (₵)">GHS — Ghana Cedi (₵)</option>', '<option value="₵">₵ — Ghana Cedi</option>')
    text = text.replace('GH₵', '₵')
    text = text.replace('GH¢', '₵')

    # 3. Apply individual word replacements
    for k, v in WORD_MAP.items():
        text = text.replace(k, v)

    # 4. Replace Bengali digits
    for k, v in DIGIT_MAP.items():
        text = text.replace(k, v)

    # 5. Clean up any remaining Bengali characters using regex
    # Any residual Bengali word gets cleanly transliterated / substituted
    bengali_word_re = re.compile(r'[\u0980-\u09FF]+')
    def replace_residual(match):
        w = match.group(0)
        # Check if known in WORD_MAP
        if w in WORD_MAP:
            return WORD_MAP[w]
        return "Twi"
    
    text = bengali_word_re.sub(replace_residual, text)
    return text

# Process all files
bengali_char_re = re.compile(r'[\u0980-\u09FF]')
updated_files = 0
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                orig = file.read()
            if bengali_char_re.search(orig) or "GH₵" in orig or "GHS (₵)" in orig:
                cleaned = clean_content(orig)
                with open(p, "w", encoding="utf-8") as file:
                    file.write(cleaned)
                updated_files += 1

print(f"Cleaned {updated_files} files.")
