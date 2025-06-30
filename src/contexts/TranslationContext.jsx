// contexts/TranslationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  en: {
    // Navbar Section (إضافة جديدة)
    navbar: {
      home: "Home",
      profile: "My Profile", 
      chat: "Chat",
      jobs: "Jobs",
      posts: "Posts", // إضافة جديدة
      postJob: "Post New Job",
      myJobs: "My Jobs",
      reports: "Reports",
      createReport: "Create Report",
      myReports: "My Reports",
      logout: "Logout",
      allJobs:"All Jobs",
      myApplications:"My Applications"
    },
    
    // Hero Section
    hero: {
      badge: "Welcome to ITI Career Gateway",
      title: "Launch Your ",
      titleHighlight: "Tech Career",
      subtitle: "As an ITI Graduate",
      description: "Exclusive opportunities for ITI graduates to connect with top tech employers. Accelerate your career with our specialized job portal designed for your expertise."
    },
    
    // Stats Section
    stats: {
      title: "ITI Success Statistics",
      titleHighlight: "Success Statistics",
      description: "Discover the impressive achievements and reach of Information Technology Institute",
      labels: {
        employmentRate: "Annual Employment Rate",
        partnerCompanies: "Partner Companies",
        universities: "Universities & Faculties",
        graduates: "ITI Graduates"
      }
    },
    
    // Companies Section
    companies: {
      title: "Top Hiring Companies",
      titleHighlight: "Hiring Companies",
      description: "Leading organizations that actively recruit ITI graduates for their technical teams",
      popularPositions: "Popular Positions:",
      visitWebsite: "Visit Website",
      companiesData: {
        valeo: {
          hiring: "120+ ITI Graduates",
          description: "Global automotive supplier specializing in driving assistance systems",
          positions: ["Software Engineer", "Embedded Systems", "Automotive Cybersecurity"]
        },
        ibm: {
          hiring: "90+ ITI Graduates", 
          description: "Technology and consulting giant with strong presence in Egypt",
          positions: ["Cloud Architect", "Data Scientist", "AI Specialist"]
        },
        itworx: {
          hiring: "75+ ITI Graduates",
          description: "Leading software development and digital transformation company", 
          positions: ["Full Stack Developer", "UX Designer", "DevOps Engineer"]
        },
        raya: {
          hiring: "60+ ITI Graduates",
          description: "Diversified technology and telecommunications group",
          positions: ["Network Engineer", "IT Consultant", "Business Analyst"]
        },
        tedata: {
          hiring: "50+ ITI Graduates",
          description: "Egypt's leading internet service provider and digital solutions company",
          positions: ["Network Administrator", "Security Specialist", "Technical Support"]
        },
        siemens: {
          hiring: "45+ ITI Graduates",
          description: "Global technology powerhouse focusing on industry, infrastructure and transport",
          positions: ["Automation Engineer", "IoT Developer", "Digital Twin Specialist"]
        }
      }
    },
    
    // Job Categories
    categories: {
      title: "Explore Career Categories",
      titleHighlight: "Career Categories",
      description: "Discover opportunities across various tech domains perfectly suited for ITI graduates",
      items: {
        softwareDevelopment: "Software Development",
        graphicDesign: "Graphic Design", 
        networkSecurity: "Network & Security",
        digitalMarketing: "Digital Marketing",
        businessManagement: "Business Management",
        artificialIntelligence: "Artificial Intelligence",
        computerEngineering: "Computer Engineering",
        dataScience: "Data Science"
      }
    },
    
    // Market Opportunities
    market: {
      title: "🚀 Perfect Timing for ITI Graduates!",
      description: "Egypt offers 20%+ cost savings compared to global tech hubs like India, making it an attractive destination for international companies. The government's Digital Egypt initiative is driving massive demand for skilled tech professionals."
    },
    
    // Locations
    locations: {
      title: "ITI Nationwide Presence", 
      titleHighlight: "Nationwide Presence",
      description: "With locations across Egypt, ITI provides quality education and career opportunities everywhere"
    },
    
    // Testimonials
    testimonials: {
      title: "Success Stories",
      description: "Hear from ITI graduates who found their dream careers through our platform",
      items: [
        {
          name: "Ahmed Mohamed",
          role: "Software Developer at Valeo",
          content: "The ITI program gave me the exact skills needed to land my dream job at Valeo."
        },
        {
          name: "Fatma Ali", 
          role: "UI/UX Designer at ITWorx",
          content: "Excellent platform with quality job listings specifically for ITI graduates."
        },
        {
          name: "Mohamed Saad",
          role: "Network Engineer at Raya", 
          content: "Love the user experience and the variety of tech opportunities available for ITI alumni."
        }
      ]
    },
    
    // CTA Section
    cta: {
      title: "Ready to Launch Your ITI Career?",
      description: "Join thousands of ITI graduates who have found their dream tech jobs through our platform",
      button: "Get Started Now"
    },
    
    // Footer
    footer: {
      description: "Your gateway to professional success and career growth as an ITI graduate.",
      quickLinks: {
        title: "Quick Links",
        items: {
          findJobs: "Find Jobs",
          postJob: "Post a Job", 
          community: "Community",
          aboutIti: "About ITI",
          reports: "Reports"
        }
      },
      categories: {
        title: "Categories",
        items: {
          softwareDev: "Software Development",
          networkEng: "Network Engineering", 
          graphicDesign: "Graphic Design",
          dataScience: "Data Science"
        }
      },
      support: {
        title: "Support",
        items: {
          helpCenter: "Help Center",
          contactUs: "Contact Us",
          privacyPolicy: "Privacy Policy", 
          termsOfService: "Terms of Service"
        }
      },
      copyright: "© 2024 ITI Career Gateway. All rights reserved."
    },
    
    // Common
    common: {
      language: "Language"
    }
  },
  
  ar: {
    // Navbar Section (إضافة جديدة)
    navbar: {
      home: "الرئيسية",
      profile: "ملفي الشخصي",
      chat: "المحادثات", 
      jobs: "الوظائف",
      posts: "المنشورات", // إضافة جديدة
      postJob: "إضافة وظيفة جديدة",
      myJobs: "وظائفي",
      reports: "التقارير",
      createReport: "إنشاء تقرير",
      myReports: "تقاريري",
      logout: "تسجيل الخروج",
      allJobs:"جميع الوظائف",
      myApplications:"تقديماتى"
    },
    
    // Hero Section
    hero: {
      badge: "مرحباً بك في بوابة المعهد القومي للاتصالات",
      title: "ابدأ ",
      titleHighlight: "مسيرتك التقنية", 
      subtitle: "كخريج معهد ITI",
      description: "فرص حصرية لخريجي معهد ITI للتواصل مع أفضل أصحاب العمل التقنيين. عجل من مسيرتك المهنية مع بوابة الوظائف المتخصصة المصممة لخبرتك."
    },
    
    // Stats Section
    stats: {
      title: "إحصائيات نجاح معهد ITI",
      titleHighlight: "نجاح",
      description: "اكتشف الإنجازات المذهلة ونطاق وصول معهد تكنولوجيا المعلومات",
      labels: {
        employmentRate: "معدل التوظيف السنوي",
        partnerCompanies: "الشركات الشريكة", 
        universities: "الجامعات والكليات",
        graduates: "خريجي معهد ITI"
      }
    },
    
    // Companies Section
    companies: {
      title: "أفضل الشركات الموظفة",
      titleHighlight: "الشركات الموظفة",
      description: "المؤسسات الرائدة التي تقوم بتوظيف خريجي معهد ITI بنشاط لفرقها التقنية",
      popularPositions: "المناصب الشائعة:",
      visitWebsite: "زيارة الموقع",
      companiesData: {
        valeo: {
          hiring: "120+ خريج من معهد ITI",
          description: "مورد سيارات عالمي متخصص في أنظمة مساعدة القيادة",
          positions: ["مهندس برمجيات", "الأنظمة المدمجة", "أمن السيارات الإلكتروني"]
        },
        ibm: {
          hiring: "90+ خريج من معهد ITI",
          description: "عملاق التكنولوجيا والاستشارات مع حضور قوي في مصر", 
          positions: ["مهندس الحوسبة السحابية", "عالم البيانات", "أخصائي الذكاء الاصطناعي"]
        },
        itworx: {
          hiring: "75+ خريج من معهد ITI",
          description: "شركة رائدة في تطوير البرمجيات والتحول الرقمي",
          positions: ["مطور Full Stack", "مصمم UX", "مهندس DevOps"]
        },
        raya: {
          hiring: "60+ خريج من معهد ITI", 
          description: "مجموعة متنوعة من التكنولوجيا والاتصالات",
          positions: ["مهندس شبكات", "استشاري تقنية المعلومات", "محلل أعمال"]
        },
        tedata: {
          hiring: "50+ خريج من معهد ITI",
          description: "مقدم خدمات الإنترنت الرائد في مصر وشركة الحلول الرقمية",
          positions: ["مدير شبكة", "أخصائي أمن", "الدعم الفني"]
        },
        siemens: {
          hiring: "45+ خريج من معهد ITI",
          description: "قوة تكنولوجية عالمية تركز على الصناعة والبنية التحتية والنقل",
          positions: ["مهندس أتمتة", "مطور إنترنت الأشياء", "أخصائي التوأم الرقمي"]
        }
      }
    },
    
    // Job Categories
    categories: {
      title: "استكشف فئات المهن",
      titleHighlight: "فئات المهن",
      description: "اكتشف الفرص عبر مختلف المجالات التقنية المناسبة تماماً لخريجي معهد ITI",
      items: {
        softwareDevelopment: "تطوير البرمجيات",
        graphicDesign: "التصميم الجرافيكي",
        networkSecurity: "الشبكات والأمن",
        digitalMarketing: "التسويق الرقمي", 
        businessManagement: "إدارة الأعمال",
        artificialIntelligence: "الذكاء الاصطناعي",
        computerEngineering: "هندسة الحاسوب",
        dataScience: "علم البيانات"
      }
    },
    
    // Market Opportunities
    market: {
      title: "🚀 الوقت المثالي لخريجي معهد ITI!",
      description: "تقدم مصر وفورات في التكلفة تزيد عن 20% مقارنة بمراكز التكنولوجيا العالمية مثل الهند، مما يجعلها وجهة جذابة للشركات الدولية. مبادرة الحكومة 'مصر الرقمية' تقود طلباً هائلاً على المهنيين التقنيين المهرة."
    },
    
    // Locations
    locations: {
      title: "انتشار معهد ITI على مستوى الجمهورية",
      titleHighlight: " على مستوى الجمهورية", 
      description: "مع وجود مواقع في جميع أنحاء مصر، يوفر معهد ITI تعليماً عالي الجودة وفرص مهنية في كل مكان"
    },
    
    // Testimonials
    testimonials: {
      title: "قصص نجاح",
      description: "استمع إلى خريجي معهد ITI الذين وجدوا وظائف أحلامهم من خلال منصتنا",
      items: [
        {
          name: "أحمد محمد",
          role: "مطور برمجيات في فاليو",
          content: "برنامج معهد ITI أعطاني المهارات الدقيقة المطلوبة للحصول على وظيفة أحلامي في فاليو."
        },
        {
          name: "فاطمة علي",
          role: "مصممة UI/UX في ITWorx", 
          content: "منصة ممتازة مع قوائم وظائف عالية الجودة مخصصة لخريجي معهد ITI."
        },
        {
          name: "محمد سعد",
          role: "مهندس شبكات في رايا",
          content: "أحب تجربة المستخدم وتنوع الفرص التقنية المتاحة لخريجي معهد ITI."
        }
      ]
    },
    
    // CTA Section
    cta: {
      title: "هل أنت مستعد لبدء مسيرتك المهنية في معهد ITI؟",
      description: "انضم إلى آلاف خريجي معهد ITI الذين وجدوا وظائف أحلامهم التقنية من خلال منصتنا",
      button: "ابدأ الآن"
    },
    
    // Footer
    footer: {
      description: "بوابتك للنجاح المهني والنمو الوظيفي كخريج معهد ITI.",
      quickLinks: {
        title: "روابط سريعة",
        items: {
          findJobs: "العثور على وظائف",
          postJob: "نشر وظيفة",
          community: "المجتمع", 
          aboutIti: "حول معهد ITI"
        }
      },
      categories: {
        title: "الفئات",
        items: {
          softwareDev: "تطوير البرمجيات",
          networkEng: "هندسة الشبكات",
          graphicDesign: "التصميم الجرافيكي",
          dataScience: "علم البيانات"
        }
      },
      support: {
        title: "الدعم",
        items: {
          helpCenter: "مركز المساعدة",
          contactUs: "اتصل بنا", 
          privacyPolicy: "سياسة الخصوصية",
          termsOfService: "شروط الخدمة"
        }
      },
      copyright: "© 2024 بوابة معهد ITI المهنية. جميع الحقوق محفوظة."
    },
    
    // Common
    common: {
      language: "اللغة"
    }
  }
};

// Create Translation Context
const TranslationContext = createContext();

// Translation Provider Component
export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === 'ar');
      
      // Update document direction and lang attribute
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  // Function to change language
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      setIsRTL(newLanguage === 'ar');
      
      // Save to localStorage
      localStorage.setItem('language', newLanguage);
      
      // Update document direction and lang attribute
      document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
    }
  };

  // Function to get translation
  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return the key if no translation found
          }
        }
        break;
      }
    }
    
    return translation || key;
  };

  const value = {
    language,
    isRTL,
    changeLanguage,
    t,
    translations: translations[language]
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translation
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;