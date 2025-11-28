import React, { useState, useEffect, useMemo } from "react";
import { 
  FaGraduationCap, 
  FaBook, 
  FaChartLine, 
  FaShieldAlt, 
  FaLightbulb, 
  FaRocket,
  FaClock,
  FaStar,
  FaPlay,
  FaCheckCircle,
  FaArrowRight,
  FaFire,
  FaTrophy,
  FaSearch
} from "react-icons/fa";
import { motion } from "framer-motion";

// Utility to check if light mode is active
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isLight;
};

function LearningHub() {
  const isLight = useThemeCheck();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgCard: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    
    bgHero: isLight
      ? "bg-gradient-to-br from-cyan-50 to-blue-50"
      : "bg-gradient-to-br from-gray-900/50 to-gray-800/50",
    
    bgCategory: isLight
      ? "bg-gray-100 hover:bg-cyan-50"
      : "bg-gray-700/30 hover:bg-cyan-500/10",
    
    bgCategoryActive: isLight
      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
    
    bgProgress: isLight ? "bg-gray-200" : "bg-gray-700",
    bgProgressFill: "bg-gradient-to-r from-cyan-500 to-blue-500",
    
    borderColor: isLight ? "border-gray-200" : "border-gray-700/50",
  }), [isLight]);

  const categories = [
    { id: "all", name: "All Topics", icon: FaBook },
    { id: "basics", name: "Basics", icon: FaGraduationCap },
    { id: "trading", name: "Trading", icon: FaChartLine },
    { id: "security", name: "Security", icon: FaShieldAlt },
    { id: "advanced", name: "Advanced", icon: FaRocket },
  ];

  const courses = [
    {
      id: 1,
      title: "Cryptocurrency Fundamentals",
      description: "Master the basics of cryptocurrency, blockchain technology, and digital assets",
      category: "basics",
      duration: "2 hours",
      lessons: 12,
      level: "Beginner",
      progress: 0,
      featured: true,
      icon: FaGraduationCap,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 2,
      title: "Trading Strategies & Analysis",
      description: "Learn technical analysis, chart patterns, and proven trading strategies",
      category: "trading",
      duration: "3 hours",
      lessons: 18,
      level: "Intermediate",
      progress: 0,
      featured: true,
      icon: FaChartLine,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Wallet Security Best Practices",
      description: "Protect your crypto assets with advanced security measures and best practices",
      category: "security",
      duration: "1.5 hours",
      lessons: 8,
      level: "Beginner",
      progress: 0,
      featured: false,
      icon: FaShieldAlt,
      color: "from-green-500 to-teal-500"
    },
    {
      id: 4,
      title: "DeFi & Smart Contracts",
      description: "Explore decentralized finance, yield farming, and smart contract interactions",
      category: "advanced",
      duration: "4 hours",
      lessons: 24,
      level: "Advanced",
      progress: 0,
      featured: true,
      icon: FaRocket,
      color: "from-orange-500 to-red-500"
    },
    {
      id: 5,
      title: "Risk Management Essentials",
      description: "Learn to manage risk, set stop losses, and protect your investment portfolio",
      category: "trading",
      duration: "2 hours",
      lessons: 10,
      level: "Intermediate",
      progress: 0,
      featured: false,
      icon: FaShieldAlt,
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: 6,
      title: "Blockchain Technology Deep Dive",
      description: "Understand how blockchain works, consensus mechanisms, and distributed ledgers",
      category: "advanced",
      duration: "3.5 hours",
      lessons: 20,
      level: "Advanced",
      progress: 0,
      featured: false,
      icon: FaLightbulb,
      color: "from-indigo-500 to-purple-500"
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredCourses = courses.filter(c => c.featured);

  return (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6`}>
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-6 sm:py-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${TC.bgHero} rounded-2xl p-6 sm:p-8 lg:p-12 mb-8`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <FaGraduationCap className="text-2xl text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Learning Hub
                </h1>
              </div>
              <p className={`text-base sm:text-lg mb-6 ${TC.textPrimary} max-w-2xl`}>
                Master cryptocurrency trading, blockchain technology, and investment strategies with our comprehensive courses
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <FaBook className="text-cyan-400" />
                  <span className={`text-sm font-medium ${TC.textPrimary}`}>{courses.length} Courses</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <FaFire className="text-orange-400" />
                  <span className={`text-sm font-medium ${TC.textPrimary}`}>{featuredCourses.length} Featured</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <FaTrophy className="text-yellow-400" />
                  <span className={`text-sm font-medium ${TC.textPrimary}`}>Earn Certificates</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl absolute -top-10 -right-10"></div>
                <FaGraduationCap className="text-9xl text-cyan-400/30 relative" />
              </div>
            </div>
          </div>
        </motion.div>



        {/* Category Filter & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300
                    ${isActive ? TC.bgCategoryActive : `${TC.bgCategory} ${TC.textSecondary}`}
                    ${isActive ? 'shadow-lg shadow-cyan-500/25 scale-105' : 'hover:scale-105'}
                  `}
                >
                  <Icon className="text-base sm:text-lg" />
                  <span className="text-sm sm:text-base">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl ${TC.bgCard} ${TC.textPrimary} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm`}
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Featured Courses */}
        {selectedCategory === "all" && featuredCourses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaStar className="text-2xl text-yellow-400" />
              <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>Featured Courses</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredCourses.map((course, idx) => (
                <CourseCardFeatured key={course.id} course={course} TC={TC} isLight={isLight} delay={0.4 + idx * 0.1} />
              ))}
            </div>
          </motion.div>
        )}

        {/* All Courses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={`text-2xl font-bold mb-6 ${TC.textPrimary}`}>
            {selectedCategory === "all" ? "All Courses" : `${categories.find(c => c.id === selectedCategory)?.name} Courses`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <CourseCard key={course.id} course={course} TC={TC} isLight={isLight} delay={0.6 + idx * 0.05} />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className={`text-lg ${TC.textSecondary}`}>No courses found matching your criteria</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

// Featured Course Card Component
const CourseCardFeatured = ({ course, TC, isLight, delay }) => {
  const Icon = course.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${TC.bgCard} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-4 bg-gradient-to-r ${course.color} rounded-xl shadow-lg`}>
          <Icon className="text-2xl text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-bold">
              FEATURED
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              course.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
              course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
              'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
            }`}>
              {course.level}
            </span>
          </div>
          <h3 className={`text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors ${TC.textPrimary}`}>
            {course.title}
          </h3>
          <p className={`text-sm mb-4 ${TC.textSecondary}`}>{course.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaClock className="text-cyan-400" />
            <span className={TC.textSecondary}>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaBook className="text-cyan-400" />
            <span className={TC.textSecondary}>{course.lessons} lessons</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <FaPlay className="text-sm" />
          <span>Start</span>
        </button>
      </div>
    </motion.div>
  );
};

// Regular Course Card Component
const CourseCard = ({ course, TC, isLight, delay }) => {
  const Icon = course.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${TC.bgCard} rounded-xl p-5 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group`}
    >
      <div className={`p-3 bg-gradient-to-r ${course.color} rounded-lg w-fit mb-4`}>
        <Icon className="text-xl text-white" />
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          course.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
          course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
          'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
        }`}>
          {course.level}
        </span>
      </div>
      
      <h3 className={`text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors ${TC.textPrimary}`}>
        {course.title}
      </h3>
      <p className={`text-sm mb-4 line-clamp-2 ${TC.textSecondary}`}>{course.description}</p>
      
      <div className="flex items-center gap-3 text-xs mb-4">
        <div className="flex items-center gap-1.5">
          <FaClock className="text-cyan-400" />
          <span className={TC.textSecondary}>{course.duration}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaBook className="text-cyan-400" />
          <span className={TC.textSecondary}>{course.lessons} lessons</span>
        </div>
      </div>
      
      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all group-hover:scale-105">
        <FaPlay className="text-sm" />
        <span>Start Learning</span>
        <FaArrowRight className="text-sm ml-auto" />
      </button>
    </motion.div>
  );
};

export default LearningHub;
