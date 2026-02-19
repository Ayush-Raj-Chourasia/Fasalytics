import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Droplets,
  Brain,
  TrendingUp,
  Smartphone,
  Leaf,
  Upload,
  BarChart3,
  FileText
} from 'lucide-react'
import Reveal from '../ui/Reveal'

function Home() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Continuous surveillance of crop conditions using satellite imagery & drone feeds'
    },
    {
      icon: Smartphone,
      title: 'Precision Irrigation',
      description: 'AI-driven water scheduling to optimize usage and ensure perfect soil moisture levels'
    },
    {
      icon: Brain,
      title: 'Pest Detection',
      description: 'Early warning systems that identify pest infestations before they spread across fields'
    },
    {
      icon: TrendingUp,
      title: 'Yield Forecasting',
      description: 'Predictive models that estimate harvest quantities with up to 88% accuracy'
    },
    {
      icon: Droplets,
      title: 'Climate Analysis',
      description: 'Hyper-local weather predictions integrated directly into your daily farming planning'
    },
    {
      icon: Leaf,
      title: 'Soil Health AI',
      description: 'Deep analysis of soil nutrient composition to recommend precise fertilizer applications'
    }
  ]

  const workflow = [
    {
      step: 'STEP 01',
      title: 'Upload',
      description: 'Capture or Upload Crop Images directly from your smartphone.',
      icon: Upload
    },
    {
      step: 'STEP 02',
      title: 'Analyze',
      description: 'Our AI engine processes the data to diagnose health & diseases.',
      icon: BarChart3
    },
    {
      step: 'STEP 03',
      title: 'Act',
      description: 'Receive actionable treatment plans and fertilizer recommendations.',
      icon: FileText
    }
  ]

  return (
    <div className="w-full bg-[#0F1724] overflow-hidden">
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-24 pb-20 relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0fbf75]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#00D28A]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 0.9, 0.13, 1] }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="inline-flex items-center gap-2.5 bg-[#0fbf75]/10 border border-[#0fbf75]/25 rounded-full px-4 py-2 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D28A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D28A]" />
                </span>
                <span className="text-sm font-semibold text-[#00D28A]">New: AI Soil Screening 2.3</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
              >
                AI-Powered Crop Health at{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0fbf75] via-[#00D28A] to-[#0fbf75]">
                  Your Fingertips
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-base sm:text-lg text-gray-400 mb-10 leading-relaxed max-w-lg"
              >
                Maximize yield and minimize waste with real-time analytics driven by advanced machine learning. Precision farming for the modern age.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(15, 191, 117, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/analyze')}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#0fbf75] to-[#00D28A] text-white font-bold rounded-lg transition-all duration-300"
                >
                  Start Analyzing →
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3.5 border border-[#0fbf75]/40 text-[#0fbf75] font-bold rounded-lg hover:bg-[#0fbf75]/10 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="text-sm">▶</span> View Dashboard
                </motion.button>
              </motion.div>
            </motion.div>

            {/* RIGHT - Image + Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 0.9, 0.13, 1] }}
              className="relative"
            >
              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/5">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=600&h=600&fit=crop"
                  alt="Crop health monitoring"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1724] via-transparent to-transparent" />
              </div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 right-4 lg:right-0 bg-[#0a0f1a]/90 backdrop-blur-xl border border-[#0fbf75]/30 rounded-xl p-5 shadow-2xl shadow-black/40"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold tracking-wider">SOIL MOISTURE</p>
                    <p className="text-2xl font-bold text-[#00D28A]">65%</p>
                    <p className="text-xs text-gray-500">Optimal</p>
                  </div>
                  <div className="w-px bg-gradient-to-b from-[#0fbf75]/50 to-transparent h-12" />
                  <div>
                    <p className="text-gray-500 text-xs font-semibold tracking-wider">HEALTH</p>
                    <p className="text-2xl font-bold text-[#0fbf75]">High</p>
                    <p className="text-xs text-green-400">↑ 2.4%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS GRID SECTION */}
      <section className="py-16 px-4 border-y border-white/5 bg-[#0a0f1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'FARMERS TRUSTED' },
              { value: '98%', label: 'AI ACCURACY' },
              { value: '1M+', label: 'ACRES ANALYZED' },
              { value: '24/7', label: 'MONITORING' }
            ].map((stat, idx) => (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#0fbf75] to-[#00D28A] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold tracking-[0.2em]">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Cultivate Intelligence</h2>
              <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Our comprehensive suite of tools leverages cutting-edge technology to give you complete control over your farm's ecosystem
              </p>
            </div>
          </Reveal>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Reveal key={idx} delay={idx * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="group relative p-6 rounded-2xl bg-[#0a0f1a]/80 border border-white/5 hover:border-[#0fbf75]/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0fbf75]/10 border border-[#0fbf75]/20 mb-5 group-hover:shadow-lg group-hover:shadow-[#0fbf75]/20 transition-all duration-300">
                      <Icon className="w-5 h-5 text-[#00D28A]" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="py-24 px-4 bg-[#0a0f1a]/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <Reveal>
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">From Field to Data in 3 Steps</h2>
              <p className="text-base text-gray-400">Our streamlined workflow gets you actionable insights in minutes</p>
            </div>
          </Reveal>

          {/* Workflow Steps */}
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-px bg-gradient-to-r from-[#0fbf75]/30 via-[#00D28A]/50 to-[#0fbf75]/30" />

            {workflow.map((w, idx) => {
              const Icon = w.icon
              return (
                <Reveal key={idx} delay={idx * 0.15}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="relative text-center"
                  >
                    {/* Step Circle */}
                    <div className="relative mx-auto w-[120px] h-[120px] mb-8">
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0px rgba(15, 191, 117, 0.2), inset 0 0 0px rgba(15, 191, 117, 0)',
                            '0 0 40px rgba(0, 210, 138, 0.25), inset 0 0 20px rgba(15, 191, 117, 0.05)',
                            '0 0 0px rgba(15, 191, 117, 0.2), inset 0 0 0px rgba(15, 191, 117, 0)'
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-full h-full rounded-full border border-[#0fbf75]/40 bg-[#0a0f1a] flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#0fbf75]/10 border border-[#0fbf75]/20 flex items-center justify-center">
                          <Icon className="w-7 h-7 text-[#00D28A]" />
                        </div>
                      </motion.div>
                    </div>

                    <p className="text-[11px] font-bold text-[#0fbf75] tracking-[0.25em] mb-3">{w.step}</p>
                    <h3 className="text-xl font-bold text-white mb-2">{w.title}</h3>
                    <p className="text-sm text-gray-500 max-w-[250px] mx-auto">{w.description}</p>
                  </motion.div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0fbf75] via-[#00D28A] to-[#0fbf75]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0F1724] mb-4 tracking-tight">Ready to transform your farm?</h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-base text-[#0F1724]/70 mb-10 max-w-lg mx-auto">
              Join farmers worldwide already using Fasalytics for precision agriculture.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(15, 23, 36, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/analyze')}
              className="px-10 py-4 bg-[#0F1724] text-white font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 text-base inline-block"
            >
              Get Started Free
            </motion.button>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-sm text-[#0F1724]/50 mt-6">No credit card required for 14-day trial</p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

export default Home
