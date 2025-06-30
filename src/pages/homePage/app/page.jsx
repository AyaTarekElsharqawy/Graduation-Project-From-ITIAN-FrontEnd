import { useEffect, useState } from "react"
import {
  Search, Users, Building2, CheckCircle, TrendingUp, Code,
  PenTool, Palette, BarChart3, DollarSign, Globe, Database,
  Megaphone, ArrowRight, Star, User, GraduationCap, Award,
  BookOpen, MapPin, Briefcase, Target, Zap, Shield, Cpu
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAddTestimonialMutation, useGetTestimonialsQuery } from '../../../api/testimonialsApi'
import { Dialog } from '@headlessui/react'
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import { useTranslation } from "../../../contexts/TranslationContext"
import LanguageSwitcher from "../../../components/LanguageSwitcher"

// Animation Components
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const cleanValue = parseInt(value);
    const increment = cleanValue / (duration / 50)
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment
        if (next >= cleanValue) {
          clearInterval(timer)
          return cleanValue
        }
        return Math.floor(next)
      })
    }, 50)
    return () => clearInterval(timer)
  }, [value, duration])

  const isPercent = typeof value === "string" && value.includes("%");
  const isPlus = typeof value === "string" && value.includes("+");

  return (
    <span>
      {count}
      {isPlus ? "+" : ""}
      {isPercent ? "%" : ""}
    </span>
  )
}

const FloatingElement = ({ children, className = "", delay = 0 }) => {
  return (
    <div
      className={`animate-bounce ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s',
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  )
}

const FadeInElement = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
    >
      {children}
    </div>
  )
}

function LandingPageContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [addTestimonial] = useAddTestimonialMutation();
  const [rating, setRating] = useState(0);

  // ---- FIX: Correctly extract testimonials from API response ----
  const { data: response = {}, isLoading: testimonialsLoading } = useGetTestimonialsQuery();
  const testimonials = Array.isArray(response.data) ? response.data : [];

  const role = useSelector((state) => state.user.role);
  const itianProfile = useSelector((state) => state.user.itianProfile);
  const employerProfile = useSelector((state) => state.user.employerProfile);

  const name = role === 'itian'
    ? itianProfile?.first_name
    : employerProfile?.company_name;

  const email = role === 'itian'
    ? itianProfile?.email
    : employerProfile?.email;

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await addTestimonial({
      name: name || "Anonymous",
      email: email || "noemail@example.com",
      role: role,
      message: message,
      rating: rating
    });
    setMessage('')
    setRating(0)
    setShowModal(false)
  }
  const { t, isRTL } = useTranslation();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("access-token");
    setIsLoggedIn(!!token);
  }, []);

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login page using React Router
    }
  };

  const itiStats = [
    { label: t('stats.labels.employmentRate'), value: "85", icon: TrendingUp, color: "from-red-500 to-rose-600" },
    { label: t('stats.labels.partnerCompanies'), value: "500", icon: Building2, color: "from-red-600 to-red-700" },
    { label: t('stats.labels.universities'), value: "80", icon: GraduationCap, color: "from-red-500 to-red-600" },
    { label: t('stats.labels.graduates'), value: "16000", icon: Users, color: "from-red-700 to-red-800" },
  ]

  const itiLocations = [
    "Smart Village", "New Capital", "Cairo University", "Alexandria", "Assiut",
    "Aswan", "Beni Suef", "Fayoum", "Ismailia", "Mansoura", "Menofia",
    "Minya", "Qena", "Sohag", "Tanta", "Zagazig", "New Valley",
    "Damanhour", "Al Arish", "Banha", "Port Said"
  ]

  const jobCategories = [
    { name: t('categories.items.softwareDevelopment'), icon: Code, color: "from-red-500 to-rose-500" },
    { name: t('categories.items.graphicDesign'), icon: Palette, color: "from-rose-500 to-pink-500" },
    { name: t('categories.items.networkSecurity'), icon: Shield, color: "from-red-600 to-red-700" },
    { name: t('categories.items.digitalMarketing'), icon: Megaphone, color: "from-red-400 to-rose-500" },
    { name: t('categories.items.businessManagement'), icon: BarChart3, color: "from-rose-600 to-red-600" },
    { name: t('categories.items.artificialIntelligence'), icon: Cpu,  color: "from-red-500 to-red-600" },
    { name: t('categories.items.computerEngineering'), icon: Building2,  color: "from-rose-500 to-red-500" },
    { name: t('categories.items.dataScience'), icon: Database,  color: "from-red-600 to-rose-600" },
  ]

  // Top Hiring Companies Data
  const hiringCompanies = [
    {
      name: "Valeo",
      logo: "/public/valeo.png",
      hiring: t('companies.companiesData.valeo.hiring'),
      description: t('companies.companiesData.valeo.description'),
      positions: t('companies.companiesData.valeo.positions'),
      website: "https://www.valeo.com"
    },
    {
      name: "IBM Egypt",
      logo: "/public/ibm.png",
      hiring: t('companies.companiesData.ibm.hiring'),
      description: t('companies.companiesData.ibm.description'),
      positions: t('companies.companiesData.ibm.positions'),
      website: "https://www.ibm.com/eg-en"
    },
    {
      name: "ITWorx",
      logo: "/public/itworx.png",
      hiring: t('companies.companiesData.itworx.hiring'),
      description: t('companies.companiesData.itworx.description'),
      positions: t('companies.companiesData.itworx.positions'),
      website: "https://www.itworx.com"
    },
    {
      name: "Raya Holding",
      logo: "/public/Raya.png",
      hiring: t('companies.companiesData.raya.hiring'),
      description: t('companies.companiesData.raya.description'),
      positions: t('companies.companiesData.raya.positions'),
      website: "https://www.raya.com"
    },
    {
      name: "TE Data",
      logo: "/public/tedata.png",
      hiring: t('companies.companiesData.tedata.hiring'),
      description: t('companies.companiesData.tedata.description'),
      positions: t('companies.companiesData.tedata.positions'),
      website: "https://www.tedata.net"
    },
    {
      name: "Siemens Egypt",
      logo: "/public/siemens1.png",
      hiring: t('companies.companiesData.siemens.hiring'),
      description: t('companies.companiesData.siemens.description'),
      positions: t('companies.companiesData.siemens.positions'),
      website: "https://www.siemens.com/eg/en"
    }
  ]


  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Language Switcher - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50"></div>
        <FloatingElement className="absolute top-20 left-10 w-20 h-20 bg-red-200 rounded-full opacity-30" delay={0} />
        <FloatingElement className="absolute top-40 right-20 w-16 h-16 bg-rose-300 rounded-full opacity-20" delay={1} />
        <FloatingElement className="absolute bottom-32 left-1/4 w-12 h-12 bg-red-300 rounded-full opacity-25" delay={2} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Side */}
            <FadeInElement className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 animate-pulse">
                  <GraduationCap className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-semibold">{t('hero.badge')}</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  {t('hero.title')} <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
                  <span className="block text-3xl mt-3 text-gray-700 font-semibold">{t('hero.subtitle')}</span>
                </h1>

                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  {t('hero.description')}
                </p>
              </div>
            </FadeInElement>

            {/* Image Side - Animated */}
            <FadeInElement delay={1} className="flex justify-center items-center">
              <div className="relative">
               <img src="/public/choice-worker-concept.png" alt="" className="max-w-md w-full rounded-lg shadow-xl" />
                <FloatingElement className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl opacity-20" delay={0.5} />
                <FloatingElement className="absolute -bottom-20 -left-30 w-32 h-32 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl opacity-20" delay={1.5} />
              </div>
            </FadeInElement>
          </div>
        </div>
      </section>

      {/* ITI Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-rose-50/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeInElement className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('stats.title').split(' ')[0]} <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{t('stats.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('stats.description')}
            </p>
          </FadeInElement>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {itiStats.map((stat, index) => (
              <FadeInElement
                key={index}
                delay={index + 2}
                className="group text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl mb-6 shadow-lg group-hover:shadow-xl group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">
                  <AnimatedCounter value={stat.value} />
                  {stat.label.includes('Rate') || stat.label.includes('معدل') ? '%' : stat.label.includes('Graduates') || stat.label.includes('خريجي') ? '+' : '+'}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </FadeInElement>
            ))}
          </div>
        </div>
      </section>

      {/* Top Hiring Companies Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeInElement className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('companies.title').split(' ')[0]} <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{t('companies.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('companies.description')}
            </p>
          </FadeInElement>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hiringCompanies.map((company, index) => (
              <FadeInElement
                key={index}
                delay={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-2 border border-gray-100 hover:border-red-200"
              >
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                  <div className="w-full h-24 flex items-center justify-center">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {company.name}
                    </h3>
                    <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                      {company.hiring}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">{company.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('companies.popularPositions')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.positions.map((position, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors"
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors group-hover:translate-x-2 transform duration-300"
                  >
                    {t('companies.visitWebsite')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </a>
                </div>
              </FadeInElement>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeInElement className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('categories.title').split(' ')[0]} <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{t('categories.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('categories.description')}
            </p>
          </FadeInElement>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {jobCategories.map((category, index) => (
              <FadeInElement
                key={index}
                delay={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-gray-100 hover:border-red-200"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-red-600 transition-colors">{category.name}</h3>
              </FadeInElement>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunities Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <FadeInElement delay={5} className="text-center">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-8 rounded-2xl shadow-xl">
              <h4 className="text-2xl font-bold mb-4">{t('market.title')}</h4>
              <p className="text-red-100 text-lg max-w-4xl mx-auto">
                {t('market.description')}
              </p>
            </div>
          </FadeInElement>
        </div>
      </section>

      {/* ITI Locations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeInElement className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('locations.title').split(' ')[0]} <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{t('locations.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('locations.description')}
            </p>
          </FadeInElement>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {itiLocations.map((location, index) => (
              <FadeInElement
                key={index}
                delay={index * 0.5}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-rose-50 p-4 rounded-xl text-center transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105"
              >
                <MapPin className="w-6 h-6 text-gray-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
                <p className="text-gray-700 group-hover:text-gray-900 font-medium text-sm">{location}</p>
              </FadeInElement>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeInElement className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('testimonials.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonials.description')}
            </p>
          </FadeInElement>

          {testimonialsLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading testimonials...</p>
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={testimonial.id || index}>
                  <FadeInElement
                    delay={index + 1}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 border-red-200 group"
                  >
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating || 0)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-red-400 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 text-lg italic">
                      "{testimonial.content || testimonial.message}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role || 'ITI Graduate'}</div>
                      </div>
                    </div>
                  </FadeInElement>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {role === 'itian' && (
            <>
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-red-700 transition"
                >
                  Review
                </button>
              </div>

              <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen bg-black/30">
                  <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md">
                    <Dialog.Title className="text-xl font-bold mb-4">Send us a message</Dialog.Title>
                    <textarea
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                      placeholder="Enter your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
               <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`w-6 h-6 cursor-pointer transition-all ${
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <p className="text-sm text-gray-500 ml-2">
                    {rating === 1 && "Very Bad"}
                    {rating === 2 && "Bad"}
                    {rating === 3 && "Okay"}
                    {rating === 4 && "Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                </div>


                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Send
                      </button>
                    </div>
                  </Dialog.Panel>
                </div>
              </Dialog>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-600 to-red-700"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Animated background elements */}
        <FloatingElement className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full" delay={0} />
        <FloatingElement className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full" delay={1} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeInElement className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">{t('cta.title')}</h2>
            <p className="text-red-100 mb-10 text-xl">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {!isLoggedIn && (
                <button
                  onClick={handleGetStarted}
                  className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  {t('cta.button')}
                </button>
              )}
            </div>
          </FadeInElement>
        </div>
      </section>
   <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16 relative overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}/>
  </div>
  
  <div className="container mx-auto px-4 relative z-10">
    <div className="grid md:grid-cols-4 gap-8">
      {/* Company Info */}
      <FadeInElement>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            ITI Career Gateway
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {t('footer.description')}
          </p>
        </div>
      </FadeInElement>

      {/* Quick Links */}
      <FadeInElement delay={1}>
        <div className="space-y-6">
          <h4 className="font-semibold mb-6 text-lg text-white border-b border-red-400 pb-2 inline-block">
            {t('footer.quickLinks.title')}
          </h4>
          <ul className="space-y-3">
            {role === 'itian' && (
              <li>
                <Link to="/jobs" className="text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {t('footer.quickLinks.items.findJobs')}
                </Link>
              </li>
            )}
            {role === 'employer' && (
              <li>
                <Link to="/employer/post-job" className="text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {t('footer.quickLinks.items.postJob')}
                </Link>
              </li>
            )}
            <li>
              <Link to="/posts" className="text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center group">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {t('footer.quickLinks.items.community')}
              </Link>
            </li>
            {role === 'itian' && (
              <li>
                <Link to="/itian/my-reports" className="text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {t('footer.quickLinks.items.reports') || 'Reports'}
                </Link>
              </li>
            )}
            {role === 'employer' && (
              <li>
                <Link to="/employer/my-reports" className="text-gray-300 hover:text-red-400 transition-all duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {t('footer.quickLinks.items.reports') || 'Reports'}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </FadeInElement>

      {/* Empty Column for Spacing */}
      <div className="hidden md:block"></div>

      {/* Company Info */}
      <FadeInElement delay={3}>
        <div className="space-y-6">
          <h4 className="font-semibold mb-6 text-lg text-white border-b border-red-400 pb-2 inline-block">
            Company
          </h4>
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-red-400/30 transition-colors duration-300">
              <p className="font-medium text-white mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Address:
              </p>
              <p className="text-sm leading-relaxed text-gray-300">
                Information Technology Institute<br/>
                Smart Village, Km 28<br/>
                Cairo-Alexandria Desert Road<br/>
                Giza, Egypt
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-red-400/30 transition-colors duration-300">
              <p className="font-medium text-white mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email:
              </p>
              <a href="mailto:info@iticareergateway.com" className="text-sm hover:text-red-400 transition-colors duration-300 text-gray-300">
                info@iticareergateway.com
              </a>
            </div>
          </div>
        </div>
      </FadeInElement>
    </div>

    {/* Copyright */}
     <div className="border-t border-gray-700/50 mt-12 pt-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-400 text-sm">{t('footer.copyright')}</p>
    </div>
  </div>
    </div>  
</footer>
    </div>
  )
}

export default LandingPageContent