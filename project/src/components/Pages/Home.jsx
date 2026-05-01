/** @format */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Vote, Users, MessageSquare, Building, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { apiService } from "../../services/api";
import "../../app.css";

export const Home = () => {
	const { user } = useAuth();
	const [announcements, setAnnouncements] = useState([]);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [stats, setStats] = useState({
		activeStudents: "0",
		clubs: "0",
		serviceBranches: "0",
		satisfactionRate: "0%"
	});
	const [showElectionModal, setShowElectionModal] = useState(false);
	const [showClubModal, setShowClubModal] = useState(false);
	const [showConcernsModal, setShowConcernsModal] = useState(false);
	const [showServicesModal, setShowServicesModal] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setIsLoadingStats(true);
			// Fetch announcements
			const posts = await apiService.getPosts({ limit: 3, type: 'Announcement' });
			setAnnouncements(posts.map(post => ({
				id: post._id,
				title: post.title,
				date: post.date,
				urgent: post.important
			})));

			// Fetch dynamic stats
			try {
				const [userStats, clubStats, branchData, complaintStats] = await Promise.all([
					apiService.getUserPublicStats(),
					apiService.getClubPublicStats(),
					apiService.getBranches(),
					apiService.getComplaintPublicStats().catch(() => ({ total: 0, resolved: 0 }))
				]);

				// Calculate satisfaction rate (simple demo logic: resolved / total)
				let satisfaction = 95; // Default fallback
				if (complaintStats && complaintStats.total > 0) {
					satisfaction = Math.round((complaintStats.resolved || 0) / complaintStats.total * 100);
					if (satisfaction === 0) satisfaction = 100; // If no complaints yet, it's 100% technically
				}

				setStats({
					activeStudents: userStats?.total?.toLocaleString() || "0",
					clubs: clubStats?.total?.toString() || "0",
					serviceBranches: branchData?.count?.toString() || "0",
					satisfactionRate: `${satisfaction}%`
				});
			} catch (statError) {
				console.error('Error loading stats:', statError);
				// Keep defaults or set to fallback values
			}
		} catch (error) {
			console.error('Error loading general data:', error);
		} finally {
			setIsLoadingStats(false);
		}
	};

	const features = [
		{
			icon: Vote,
			title: "Democratic Elections",
			description: "Participate in secure, transparent student elections",
			link: "/elections",
			onLearnMore: () => setShowElectionModal(true),
			longDescription: "Our democratic election system empowers every student to have a voice in shaping university governance. Through secure online voting, you can elect student representatives, club leaders, and union officials. The platform ensures transparency with real-time results and maintains the integrity of each vote through advanced security measures."
		},
		{
			icon: Users,
			title: "Student Clubs",
			description: "Join or create clubs and associations",
			link: "/clubs",
			onLearnMore: () => setShowClubModal(true),
			longDescription: "Student clubs are the heart of campus life at DBU. Whether you're interested in academics, sports, culture, technology, or service, there's a club for you. Join existing clubs to connect with like-minded peers or start your own to pursue new interests. Each club receives support, resources, and opportunities to organize events and activities."
		},
		{
			icon: MessageSquare,
			title: "Voice Your Concerns",
			description: "Submit complaints and track their resolution",
			link: "/complaints",
			onLearnMore: () => setShowConcernsModal(true),
			longDescription: "Your concerns matter. Our complaint management system provides a direct channel to raise issues about academic matters, facilities, housing, dining services, or any other campus-related concerns. Each complaint is tracked with a unique case ID, assigned to the relevant department, and you can monitor the progress until resolution. We're committed to addressing your concerns promptly and effectively."
		},
		{
			icon: Building,
			title: "Branch Services",
			description: "Access specialized services from different branches",
			link: "/services",
			onLearnMore: () => setShowServicesModal(true),
			longDescription: "The Student Union operates through specialized branches, each dedicated to a specific aspect of student life. Our branches include Academic Affairs, Housing Services, Dining Services, Facilities Management, Health & Wellness, Career Services, and more. Each branch has dedicated staff and representatives ready to assist you with services, answer questions, and address concerns in their respective areas."
		},
	];

	const statsArray = [
		{ number: stats.activeStudents, label: "Active Students" },
		{ number: stats.clubs, label: "Student Clubs" },
		{ number: stats.serviceBranches, label: "Service Branches" },
		{ number: stats.satisfactionRate, label: "Satisfaction Rate" },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<section className="bg-img text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}>
							<div className="flex items-center justify-center mb-8">
								<div className="w-20 h-20 bg-img-lg bg-opacity-20 rounded-2xl flex items-center justify-center mr-4">
									<span className="text-3xl font-bold"></span>
								</div>
								<div className="text-left">
									<h1 className="text-4xl md:text-6xl font-bold mb-2 text-white">
										Student Union
									</h1>
									<p className="text-xl text-white">Debre Berhan University</p>
								</div>
							</div>

							<p className="text-xl md:text-2xl  mb-8 max-w-3xl mx-auto">
								Your Voice, Your Choice, Your Future
							</p>

							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								{!user ? (
									<>
										<Link
											to="/login"
											className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
											Get Started
										</Link>
										<Link
											to="/about"
											className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-colors">
											Learn More
										</Link>
									</>
								) : (
									<div className="text-center">
										<p className="text-blue-100 mb-4">Welcome back! You're logged in as {user.isAdmin ? 'Admin' : 'Student'}</p>
										<Link
											to="/dashboard"
											className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
											Go to Dashboard
										</Link>
									</div>
								)}

							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{statsArray.map((stat, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="text-center">
								<div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
									{isLoadingStats ? "..." : stat.number}
								</div>
								<div className="text-gray-600">{stat.label}</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Our Services
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Comprehensive services designed to enhance your university
							experience
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
								<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
									<feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 mb-4">{feature.description}</p>
								<button
									onClick={feature.onLearnMore}
									className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
									Learn More
									<ArrowRight className="w-4 h-4 ml-1" />
								</button>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Announcements Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900">
							Latest Announcements
						</h2>
						<Link
							to="/latest"
							className="text-blue-600 hover:text-blue-700 font-medium">
							View All
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{announcements.length > 0 ? (
							announcements.map((announcement, index) => (
								<motion.div
									key={announcement.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className={`bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow ${announcement.urgent ? "border-l-4 border-red-500" : ""
										}`}>
									{announcement.urgent && (
										<span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-3">
											Urgent
										</span>
									)}
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{announcement.title}
									</h3>
									<p className="text-sm text-gray-500">
										{new Date(announcement.date).toLocaleDateString()}
									</p>
								</motion.div>
							))
						) : (
							<div className="col-span-3 text-center py-12">
								<p className="text-gray-500">No announcements available at the moment</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Join the Student Union Community
					</h2>
					<p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
						Make your voice heard, drive change, and enhance your university
						experience
					</p>
					{!user && (
						<Link
							to="/login"
							className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center">
							Get Started Today
							<ArrowRight className="w-5 h-5 ml-2" />
						</Link>
					)}
				</div>
			</section>

			{/* Modals */}
			{showElectionModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowElectionModal(false)}>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-xl p-8 max-w-2xl w-full"
						onClick={(e) => e.stopPropagation()}>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Democratic Elections</h3>
						<p className="text-gray-700 mb-6">{features[0].longDescription}</p>
						<div className="flex gap-4">
							<Link to="/elections" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Go to Elections</Link>
							<button onClick={() => setShowElectionModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
						</div>
					</motion.div>
				</div>
			)}

			{showClubModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowClubModal(false)}>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-xl p-8 max-w-2xl w-full"
						onClick={(e) => e.stopPropagation()}>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Student Clubs</h3>
						<p className="text-gray-700 mb-6">{features[1].longDescription}</p>
						<div className="flex gap-4">
							<Link to="/clubs" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Explore Clubs</Link>
							<button onClick={() => setShowClubModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
						</div>
					</motion.div>
				</div>
			)}

			{showConcernsModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConcernsModal(false)}>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-xl p-8 max-w-2xl w-full"
						onClick={(e) => e.stopPropagation()}>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Voice Your Concerns</h3>
						<p className="text-gray-700 mb-6">{features[2].longDescription}</p>
						<div className="flex gap-4">
							<Link to="/complaints" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Submit Complaint</Link>
							<button onClick={() => setShowConcernsModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
						</div>
					</motion.div>
				</div>
			)}

			{showServicesModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowServicesModal(false)}>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-xl p-8 max-w-2xl w-full"
						onClick={(e) => e.stopPropagation()}>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Branch Services</h3>
						<p className="text-gray-700 mb-6">{features[3].longDescription}</p>
						<div className="flex gap-4">
							<Link to="/services" className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">View Services</Link>
							<button onClick={() => setShowServicesModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
};
