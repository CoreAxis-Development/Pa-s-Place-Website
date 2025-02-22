import React from 'react';
import Header from '@/components/Header';
import { Calendar, Users, Heart, MapPin, Phone } from 'lucide-react';
import Footer from '../../components/Footer';
const VenuePage = () => {
    return (
        <>
            <Header />
            <div className="min-h-screen">
                {/* Hero Section */}
                <div
                    className="relative h-[70vh] bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://source.unsplash.com/1600x900/?rustic,venue')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Host Your Special Day at Pa's Place</h1>
                        <p className="text-xl text-white max-w-2xl">Where Memories Are Made and Hearts Are Warmed</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    {/* Introduction */}
                    <div
                        className="text-center max-w-3xl mx-auto mb-16 p-8 rounded-xl"
                        style={{
                            backgroundImage: "url('https://source.unsplash.com/1600x900/?texture,wood')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="bg-white/90 p-6 rounded-lg">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">A Magical Venue for Every Celebration</h2>
                            <p className="text-lg text-gray-600">
                                Nestled in the heart of Kelso, Pennington, Pa's Place offers a unique blend of rustic charm and modern amenities,
                                perfect for creating unforgettable celebrations for all ages.
                            </p>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="p-6 text-center rounded-lg shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-b from-blue-50 to-white border border-blue-100">
                            <div className="flex justify-center mb-4">
                                <Calendar className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Perfect for Parties</h3>
                            <p className="text-gray-600">
                                From magical children's birthday parties to family gatherings, our venue adapts to your needs
                            </p>
                        </div>

                        <div className="p-6 text-center rounded-lg shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-b from-green-50 to-white border border-green-100">
                            <div className="flex justify-center mb-4">
                                <Users className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
                            <p className="text-gray-600">
                                State-of-the-art security systems and dedicated staff ensure peace of mind
                            </p>
                        </div>

                        <div className="p-6 text-center rounded-lg shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-b from-red-50 to-white border border-red-100">
                            <div className="flex justify-center mb-4">
                                <Heart className="h-12 w-12 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">All-Inclusive</h3>
                            <p className="text-gray-600">
                                Access to entertainment facilities including trampoline and putt-putt course
                            </p>
                        </div>
                    </div>

                    {/* Activities Section */}
                    <div
                        className="rounded-xl p-8 mb-16 relative overflow-hidden"
                        style={{
                            backgroundImage: "url('https://source.unsplash.com/1600x900/?garden,playground')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-white/90" />
                        <div className="relative">
                            <h2 className="text-3xl font-bold text-center mb-8">Entertainment for All Ages</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                                    <h3 className="text-xl font-semibold mb-4 text-blue-700">For the Little Ones</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-600">•</span> Trampoline for endless bouncy fun
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-600">•</span> Mini putt-putt course adventures
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-600">•</span> Safe, enclosed play areas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-600">•</span> Nature observation opportunities
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white/80 p-6 rounded-lg shadow-lg">
                                    <h3 className="text-xl font-semibold mb-4 text-green-700">Additional Features</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-600">•</span> Walking distance to Nkomba Beach
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-600">•</span> Beautiful garden spaces
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-600">•</span> Ample parking space
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-600">•</span> Modern restroom facilities
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div
                        className="text-center rounded-xl p-8"
                        style={{
                            backgroundImage: "url('https://source.unsplash.com/1600x900/?sunset,beach')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="bg-white/90 p-6 rounded-lg inline-block">
                            <h2 className="text-3xl font-bold mb-8">Book Your Celebration</h2>
                            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-6 w-6 text-blue-600" />
                                    <p>35b Umdoni Road, Kelso, Pennington</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-6 w-6 text-blue-600" />
                                    <p>Contact us to discuss your event</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VenuePage;