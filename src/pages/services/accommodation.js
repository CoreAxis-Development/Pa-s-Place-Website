import React from 'react';
import Header from '@/components/Header';
import { Shield, Home, Moon, Sun, Coffee, Users } from 'lucide-react';

const Accommodation = () => {
    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="relative">
                <div
                    className="h-[70vh] bg-cover bg-center"
                    style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?beach,resort')" }}
                >
                    <div className="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">Rest & Recharge at Pa's Place</h1>
                        <p className="text-white text-xl mt-4 px-4 text-center max-w-2xl">
                            Experience comfort, security, and tranquility in our thoughtfully designed accommodations
                        </p>
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Your Sanctuary by the Sea</h2>
                            <p className="text-gray-600 mb-4">
                                Nestled in the serene surroundings of Kelso, Pennington, our accommodations offer more than just a place to stay. Each space has been thoughtfully designed to provide comfort, privacy, and peace of mind.
                            </p>
                            <p className="text-gray-600">
                                With state-of-the-art security systems and dedicated staff, you can fully relax and focus on making the most of your time here.
                            </p>
                        </div>
                        <div
                            className="rounded-xl overflow-hidden shadow-xl h-80"
                            style={{
                                backgroundImage: "url('https://source.unsplash.com/1600x900/?bedroom,modern')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Accommodation Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                                <h3 className="text-xl font-bold">Security & Privacy</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>• 24/7 CCTV surveillance</li>
                                <li>• Gender-segregated dormitories</li>
                                <li>• Private bathroom facilities</li>
                                <li>• Secure access control</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Home className="h-8 w-8 text-green-600 mr-3" />
                                <h3 className="text-xl font-bold">Comfort & Amenities</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Quality bedding and linens</li>
                                <li>• Climate-controlled rooms</li>
                                <li>• Common living spaces</li>
                                <li>• Storage facilities</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Coffee className="h-8 w-8 text-yellow-600 mr-3" />
                                <h3 className="text-xl font-bold">Daily Essentials</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Fresh towels and toiletries</li>
                                <li>• Cleaning service</li>
                                <li>• Laundry facilities</li>
                                <li>• First aid supplies</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Schedule */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Daily Schedule</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-4">
                                <Sun className="h-8 w-8 text-yellow-500 mr-3" />
                                <h3 className="text-xl font-bold">Morning</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>6:00 AM - Early morning beach access</li>
                                <li>7:00 AM - Breakfast time</li>
                                <li>8:00 AM - Room cleaning service</li>
                                <li>9:00 AM - Activities begin</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-4">
                                <Moon className="h-8 w-8 text-blue-500 mr-3" />
                                <h3 className="text-xl font-bold">Evening</h3>
                            </div>
                            <ul className="space-y-2 text-gray-600">
                                <li>6:00 PM - Dinner time</li>
                                <li>7:00 PM - Evening activities</li>
                                <li>9:00 PM - Quiet hours begin</li>
                                <li>10:00 PM - Facility secure time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Info */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12">What to Expect</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Community Living</h3>
                            <p className="text-gray-600">Experience the joy of shared spaces while maintaining personal privacy</p>
                        </div>

                        <div className="text-center p-6">
                            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Safety First</h3>
                            <p className="text-gray-600">24/7 security measures ensure peace of mind during your stay</p>
                        </div>

                        <div className="text-center p-6">
                            <Home className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Home Comfort</h3>
                            <p className="text-gray-600">All the amenities you need for a comfortable stay</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Accommodation;