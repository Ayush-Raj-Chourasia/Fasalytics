import React from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Droplets, 
  Thermometer,
  TrendingUp, 
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react'
import HeroParallax from '../ui/HeroParallax'
import Reveal from '../ui/Reveal'
import GradientButton from '../ui/GradientButton'
import GlassPanel from '../ui/GlassPanel'
import '../styles/home.css'

function Home() {
  const features = [
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Monitor crop health with real-time sensor data and AI analysis'
    },
    {
      icon: Droplets,
      title: 'Soil Analysis',
      description: 'Comprehensive soil moisture, pH, and nutrient analysis'
    },
    {
      icon: Thermometer,
      title: 'Climate Tracking',
      description: 'Track temperature, humidity, and leaf wetness conditions'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Get early warnings for crop stress and disease risks'
    },
    {
      icon: Shield,
      title: 'Expert Recommendations',
      description: 'Receive actionable recommendations to improve crop health'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'AI-powered analysis with confidence scores and zone mapping'
    }
  ]

  return (
    <div className="home bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero with Parallax */}
      <HeroParallax />

      {/* Features Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Section Header */}
          <Reveal>
            <div className="text-center mb-14 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Powerful Features for Modern Farming
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to maximize crop yield and minimize risks with AI-powered insights
              </p>
            </div>
          </Reveal>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Reveal key={index} delay={index * 0.1}>
                  <GlassPanel className="flex flex-col items-start group hover:shadow-elevated transition-shadow">
                    <motion.div
                      initial={{ scale: 1, rotate: 0 }}
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 rounded-lg  bg-gradient-to-br from-[#0fbf75]/20 to-[#008f5a]/20 text-[#008f5a] mb-4"
                    >
                      <Icon size={24} />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassPanel>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-16">
              How Fasalytics Works
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: '1', title: 'Input Data', desc: 'Provide sensor readings or upload field images' },
              { num: '2', title: 'AI Analysis', desc: 'Our ML models process and analyze the data' },
              { num: '3', title: 'Get Results', desc: 'Receive detailed health status and recommendations' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="relative flex flex-col items-center">
                  {/* Step Number Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-[#0fbf75] to-[#008f5a] flex items-center justify-center text-white font-bold text-lg shadow-soft"
                  >
                    {step.num}
                  </motion.div>

                  {/* Arrow (hidden on mobile) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute left-full top-7 w-8 h-0.5 bg-gradient-to-r from-[#0fbf75] to-transparent" />
                  )}

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Reveal threshold={0.3}>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Ready to Monitor Your Crops?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Start analyzing your crop health today with Fasalytics AI. Get instant insights, early warnings, and actionable recommendations.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <GradientButton
                  onClick={() => window.location.href = '/analyze'}
                  className="px-8 py-4 text-lg"
                  ariaLabel="Begin crop analysis journey"
                >
                  <span>Begin Analysis</span>
                  <ArrowRight size={20} />
                </GradientButton>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

export default Home
