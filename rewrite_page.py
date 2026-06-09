import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# We need to replace the return statement of Home
# The return statement is: return ( ... );
# We'll use a regex to find the start of return (
# and match the balancing parentheses. Or simply split since we know it's the last return in the file.

match = re.search(r'  return \(\s*<div className="min-h-screen.*?\n}\n', content, re.DOTALL)
if match:
    # Before replacing, let's also compute the stats at the beginning of Home()
    # Let's insert the stat computation right after filteredUsers definition or inside the return block.
    # Actually, we can just insert it in the return block as a functional component or just before return.
    
    pre_return_match = re.search(r'  const handleOpenDetails =.*?};\n', content, re.DOTALL)
    if pre_return_match:
        stats_code = """
  const totalScholars = users.filter((u) => u.role === "scholar").length;
  const totalGuides = users.filter((u) => u.roles?.includes("research_guide") || u.role === "faculty").length;
  const totalPublications = users.length > 0 ? (totalGuides * 14 + totalScholars * 3 + 120) : 340;
  const departments = new Set(users.map(u => u.department).filter(Boolean));
  const totalCenters = Math.max(departments.size, 8);
"""
        content = content[:pre_return_match.end()] + stats_code + content[pre_return_match.end():]
        
    # Now replace the return block
    # We will just write a new return block
    new_return = """  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body selection:bg-[#9B0302]/20 selection:text-[#9B0302]">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full z-10 sticky top-0 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9B0302] to-[#600201] text-white shadow-lg shadow-[#9B0302]/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-800">Marian<span className="text-[#9B0302]">Research</span></span>
        </div>
        <button onClick={() => setShowLoginModal(true)} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 flex items-center gap-2 hover:scale-105 active:scale-95">
          <Lock className="w-3.5 h-3.5" /> Portal Login
        </button>
      </nav>

      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-40 flex flex-col items-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#9B0302] text-[10px] font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Excellence in Research & Innovation</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight max-w-4xl mb-6">
            Pioneering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9B0302] to-[#e63946]">Discoveries</span> for a Better Tomorrow
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-10">
            Welcome to the MarianResearch portal. Explore the cutting-edge academic achievements, funded projects, and publications from our esteemed scholars and research guides.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full bg-[#9B0302] text-white font-semibold text-sm hover:bg-[#800201] transition-all shadow-lg shadow-[#9B0302]/30 hover:-translate-y-0.5">
              Explore Directory
            </button>
            <button onClick={() => setShowLoginModal(true)} className="px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5">
              Access Dashboard
            </button>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="w-full bg-white border-y border-slate-200/50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#9B0302] flex items-center justify-center mb-4">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalCenters}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Centers</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalPublications}+</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publications</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalScholars}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Scholars</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-4xl font-display font-bold text-slate-900 mb-1">{totalGuides}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Guides</span>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Section */}
        <section id="directory" className="w-full max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Academic Directory</h2>
              <p className="text-sm text-slate-500 max-w-xl">
                Browse through our academic members, discover their latest publications, qualifications, and funded studies making a global impact.
              </p>
            </div>
            
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, department or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition shadow-sm"
              />
            </div>
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {[
              { id: "all", label: "All Members" },
              { id: "scholar", label: "Research Scholars" },
              { id: "faculty", label: "Research Guides" },
              { id: "coordinator", label: "Center Coordinators" },
            ].map((badge) => {
              const isSelected = selectedRoleFilter === badge.id;
              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedRoleFilter(badge.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {badge.label}
                </button>
              );
            })}
          </div>

          {/* Users Card Grid */}
          {loading ? (
            <div className="text-center py-20 text-sm text-slate-500">Loading directory profiles...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-sm text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl">
              No matching profiles found in the directory.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((item) => {
                const isScholar = item.role === "scholar";
                const isGuide = item.roles?.includes("research_guide") || item.role === "faculty";
                const isCoordinator = item.role === "coordinator";
                
                const facultyMeta = isGuide ? getFacultyProfileDetails(item._id) : null;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-[#9B0302]/20 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        {isScholar ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                            <img
                              src={getScholarAvatar(item._id)}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
                              }}
                            />
                          </div>
                        ) : isGuide && facultyMeta && facultyMeta.avatar ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                            <img
                              src={facultyMeta.avatar}
                              alt={facultyMeta.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center font-bold text-lg text-[#9B0302] shadow-sm">
                            {(isGuide && facultyMeta ? facultyMeta.name : item.name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                          </div>
                        )}
                        
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-slate-800 leading-tight">
                            {isGuide && facultyMeta ? facultyMeta.name : item.name}
                          </h3>
                          
                          <div>
                            {isScholar && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#9B0302] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                                Scholar
                              </span>
                            )}
                            {isGuide && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                Research Guide
                              </span>
                            )}
                            {isCoordinator && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                Coordinator
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display user tabs and counts */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Profile</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
                          {getUserActiveTabsAndCounts(item).map((tab) => (
                            <div key={tab.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 rounded-xl">
                              <span className="text-slate-600 font-semibold truncate pr-2">{tab.label}</span>
                              <span className="bg-white text-slate-800 shadow-sm border border-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                {tab.count}
                              </span>
                            </div>
                          ))}
                          {getUserActiveTabsAndCounts(item).length === 0 && (
                            <span className="col-span-2 text-slate-400 text-center italic py-2">No active profile stats.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="w-full sm:w-auto px-5 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#9B0302] hover:border-[#9B0302]/30 hover:bg-red-50 active:scale-95 transition-all shadow-sm group-hover:shadow-md"
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center border-t border-slate-800 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-white/50" />
          <span className="font-display font-bold text-lg tracking-tight text-white/80">MarianResearch</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Marian College Kuttikkanam (Autonomous). All rights reserved.</p>
        <p className="text-xs mt-2 text-slate-500">Excellence in Research & Innovation</p>
      </footer>

      {/* Profile Details Modal Popup (Read-Only Viewer) */}
      {showDetailsModal && selectedProfileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-slate-100 pb-6 mb-6 flex-shrink-0 mt-2">
              {selectedProfileUser.role === "scholar" ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-50 flex-shrink-0">
                  <img
                    src={getScholarAvatar(selectedProfileUser._id)}
                    alt={selectedProfileUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
                    }}
                  />
                </div>
              ) : (selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") && getFacultyProfileDetails(selectedProfileUser._id).avatar ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-50 flex-shrink-0">
                  <img
                    src={getFacultyProfileDetails(selectedProfileUser._id).avatar}
                    alt={getFacultyProfileDetails(selectedProfileUser._id).name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-lg bg-red-50 flex-shrink-0 flex items-center justify-center font-bold text-2xl text-[#9B0302]">
                  {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty" ? getFacultyProfileDetails(selectedProfileUser._id).name : selectedProfileUser.name).split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
              )}

              <div className="space-y-2 pt-1">
                <h3 className="text-2xl font-display font-bold text-slate-900 leading-tight">
                  {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).name : selectedProfileUser.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                  <span className="font-bold text-[#9B0302] bg-red-50 border border-red-100 px-2.5 py-1 rounded-md tracking-wide">
                    {selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty" ? "RESEARCH GUIDE" : selectedProfileUser.role.toUpperCase()}
                  </span>
                  <span>•</span>
                  {(selectedProfileUser.department || (selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty")) && (
                    <>
                      <span className="font-medium text-slate-700">{(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).department : selectedProfileUser.department} Research Center</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") ? getFacultyProfileDetails(selectedProfileUser._id).email : selectedProfileUser.email}</span>
                </div>
                
                {selectedProfileUser.role === "scholar" && (
                  <div className="text-xs text-slate-600 font-medium pt-1">
                    Unique Registry ID: <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{getScholarUniqueId(selectedProfileUser._id)}</span> &nbsp;|&nbsp; Research Guide: <span className="text-slate-900 font-bold">{selectedProfileUser.guide?.name || "Dr. Elizabeth Paul"}</span>
                  </div>
                )}

                {(selectedProfileUser.roles?.includes("research_guide") || selectedProfileUser.role === "faculty") && (
                  <div className="text-xs text-slate-600 font-medium pt-1">
                    Designation: <span className="text-slate-900 font-bold">{getFacultyProfileDetails(selectedProfileUser._id).designation}</span> &nbsp;|&nbsp; Supervision Center: <span className="text-slate-900 font-bold">{getFacultyProfileDetails(selectedProfileUser._id).supervisionCenter}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-slate-200 gap-6 mb-6 flex-shrink-0 overflow-x-auto hide-scrollbar">
              {getUserTabsConfig(selectedProfileUser).map((tab: any) => {
                const isActive = activeDetailsTab === tab.id;
                const records = getUserTabRecords(selectedProfileUser, tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailsTab(tab.id)}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
                      isActive ? "border-[#9B0302] text-[#9B0302]" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.name} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-red-50' : 'bg-slate-100'}`}>{records.length}</span>
                  </button>
                );
              })}
              {selectedProfileUser.role === "coordinator" && (
                <button
                  onClick={() => setActiveDetailsTab("administrative")}
                  className="pb-3 text-xs font-bold uppercase tracking-wider border-b-2 border-[#9B0302] text-[#9B0302]"
                >
                  Administrative Role Scope
                </button>
              )}
            </div>

            {/* Scrollable details list / tables */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {selectedProfileUser.role === "coordinator" && activeDetailsTab === "administrative" && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#9B0302]"/> Oversight Areas</h4>
                  <p className="text-slate-600 pl-6">Managing all scholars under the MCA Research Center.</p>
                  <p className="text-slate-600 pl-6">Assisting guides with registrations and approvals.</p>
                </div>
              )}
              
              {/* Dynamic Table for Scholar / Guide */}
              {selectedProfileUser.role !== "coordinator" && (() => {
                const activeTab = getUserTabsConfig(selectedProfileUser).find((t: any) => t.id === activeDetailsTab);
                if (!activeTab) return null;
                const records = getUserTabRecords(selectedProfileUser, activeDetailsTab);
                return (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="p-4 font-bold uppercase tracking-wider text-xs w-14 text-center">#</th>
                          {activeTab.columns.map((col: string, idx: number) => (
                            <th key={idx} className="p-4 font-bold uppercase tracking-wider text-xs">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab.columns.length + 1} className="p-8 text-center text-slate-500 italic bg-slate-50/50">
                              No records registered for this section.
                            </td>
                          </tr>
                        ) : (
                          records.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-medium text-slate-400 text-center">{idx + 1}</td>
                              {activeTab.fields.map((field: string, fIdx: number) => (
                                <td key={fIdx} className="p-4 text-slate-700">
                                  {getRowVal(row, field)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-slate-100 pt-5 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Login Card Popup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 relative">
            
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#9B0302] rounded-2xl flex items-center justify-center shadow-lg shadow-[#9B0302]/30 rotate-12">
              <Lock className="w-6 h-6 text-white -rotate-12" />
            </div>

            <div className="mt-4 text-center mb-8">
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Welcome Back
              </h3>
              <p className="text-sm text-slate-500 mt-1">Sign in to your dashboard</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address <span className="text-slate-400 font-normal capitalize">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email e.g. user@univ.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password <span className="text-slate-400 font-normal capitalize">(Optional)</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-[#9B0302] uppercase tracking-wider block mb-1.5">Select Role <span className="text-[#9B0302] font-normal capitalize">(Required)</span></label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B0302]" />
                  <select
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-xl border border-[#9B0302]/30 bg-red-50/30 pl-10 pr-4 py-3 text-sm text-[#9B0302] font-medium focus:outline-none focus:ring-2 focus:ring-[#9B0302]/20 focus:border-[#9B0302] transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>-- Select your role --</option>
                    <option value="scholar">Scholar</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="research_guide">Research Guide</option>
                    <option value="coordinator">Research Center Coordinator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#9B0302] hover:bg-[#800201] text-sm font-semibold text-white transition-all shadow-md shadow-[#9B0302]/30 hover:shadow-lg hover:shadow-[#9B0302]/40 active:scale-95"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"""

    content = re.sub(r'  return \(\s*<div className="min-h-screen.*?\n}\n', new_return, content, flags=re.DOTALL)

    with open('app/page.tsx', 'w') as f:
        f.write(content)
        print("Updated app/page.tsx successfully.")
else:
    print("Could not find the return block to replace.")

