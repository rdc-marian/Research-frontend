"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { scholarNav } from "@/data/roleNav";
import { apiGet, apiPostForm, apiPatchForm } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

function ScholarPortfolioFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const category = (params.category as string) || "";
  const itemId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Unified form state for all fields
  const [formState, setFormState] = useState<Record<string, any>>({
    degree: "",
    subject: "",
    institution: "",
    university: "",
    yearOfPassing: "",
    percentage: "",
    status: "",

    title: "",
    authors: "",
    journalName: "",
    volume: "",
    issue: "",
    pages: "",
    issnIsbn: "",
    publishDate: "",
    impactFactor: "",
    indexing: [] as string[],
    publicationUrl: "",

    paperTitle: "",
    presentationType: "",
    organizer: "",
    venue: "",
    startDate: "",
    endDate: "",
    proceedingsDetails: "",

    applicationNumber: "",
    patentStatus: "",
    filingDate: "",
    publicationDate: "",
    grantDate: "",
    inventors: "",
    patentUrl: "",

    role: "",
    durationDays: "",
    fundingAgency: "",

    professionalBody: "",
    membershipNumber: "",
    membershipType: "",
    expiryDate: "",

    name: "",
    sponsoringAgency: "",
    amountPerMonth: "",
    scholarshipStatus: "",

    file: null as File | null,
  });

  useEffect(() => {
    if (!itemId || !category) return;
    let isMounted = true;

    const loadItem = async () => {
      try {
        setLoading(true);
        const apiPathMap: Record<string, string> = {
          qualifications: `/qualifications/${itemId}`,
          publications: `/publications/${itemId}`,
          conferences: `/conferences/${itemId}`,
          patents: `/patents/${itemId}`,
          workshops: `/workshops/${itemId}`,
          memberships: `/memberships/${itemId}`,
          scholarships: `/scholarships/${itemId}`,
        };
        const res = await apiGet<{ item: Record<string, any> }>(apiPathMap[category]);
        if (!isMounted) return;

        const item = res.item;
        // Map dates properly to YYYY-MM-DD
        const mapDate = (d?: string) => {
          if (!d) return "";
          return new Date(d).toISOString().split("T")[0];
        };

        setFormState((prev) => ({
          ...prev,
          ...item,
          publishDate: mapDate(item.publishDate),
          startDate: mapDate(item.startDate),
          endDate: mapDate(item.endDate),
          filingDate: mapDate(item.filingDate),
          publicationDate: mapDate(item.publicationDate),
          grantDate: mapDate(item.grantDate),
          expiryDate: mapDate(item.expiryDate),
          indexing: item.indexing || [],
          file: null, // Reset file so user doesn't overwrite unless they upload new
        }));
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load item details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [itemId, category]);

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (val: string, checked: boolean) => {
    const current = formState.indexing as string[];
    if (checked) {
      handleChange("indexing", [...current, val]);
    } else {
      handleChange("indexing", current.filter((x) => x !== val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = new FormData();
      payload.append("scholarId", user._id);

      // Populate payload fields based on category
      const appendFields = (keys: string[]) => {
        keys.forEach((k) => {
          if (formState[k] !== undefined && formState[k] !== null && formState[k] !== "") {
            payload.append(k, String(formState[k]).trim());
          }
        });
      };

      if (category === "qualifications") {
        appendFields(["degree", "subject", "institution", "university", "yearOfPassing", "percentage", "status"]);
      } else if (category === "publications") {
        appendFields(["title", "authors", "journalName", "volume", "issue", "pages", "issnIsbn", "publishDate", "impactFactor", "publicationUrl"]);
        payload.append("indexing", JSON.stringify(formState.indexing));
      } else if (category === "conferences") {
        appendFields(["title", "paperTitle", "presentationType", "organizer", "venue", "startDate", "endDate", "proceedingsDetails"]);
      } else if (category === "patents") {
        appendFields(["title", "applicationNumber", "patentStatus", "filingDate", "publicationDate", "grantDate", "inventors", "patentUrl"]);
      } else if (category === "workshops") {
        appendFields(["title", "role", "organizer", "venue", "startDate", "endDate", "durationDays", "fundingAgency"]);
      } else if (category === "memberships") {
        appendFields(["professionalBody", "membershipNumber", "membershipType", "startDate", "expiryDate"]);
      } else if (category === "scholarships") {
        appendFields(["name", "sponsoringAgency", "amountPerMonth", "startDate", "endDate", "scholarshipStatus"]);
      }

      if (formState.file) {
        payload.append("file", formState.file);
      }

      const apiPathMap: Record<string, string> = {
        qualifications: "/qualifications",
        publications: "/publications",
        conferences: "/conferences",
        patents: "/patents",
        workshops: "/workshops",
        memberships: "/memberships",
        scholarships: "/scholarships",
      };

      const path = itemId ? `${apiPathMap[category]}/${itemId}` : apiPathMap[category];

      if (itemId) {
        await apiPatchForm(path, payload);
        setSuccess("Achievement updated successfully.");
      } else {
        await apiPostForm(path, payload);
        setSuccess("Achievement created successfully.");
      }

      // Redirect back after short delay
      setTimeout(() => {
        router.push(`/scholar/portfolio/${category}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  const titles: Record<string, string> = {
    qualifications: "Qualification",
    publications: "Publication",
    conferences: "Conference",
    patents: "Patent",
    workshops: "Workshop / FDP",
    memberships: "Professional Membership",
    scholarships: "Scholarship / Fellowship",
  };

  const currentTitle = titles[category] || "Portfolio Item";

  return (
    <PageLayout
      title={`${itemId ? "Edit" : "Add"} ${currentTitle}`}
      userName={user?.name || "Scholar User"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="My Portfolio"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href={`/scholar/portfolio/${category}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
        <h2 className="font-display text-lg text-[color:var(--maroon-900)] mt-4 font-bold">
          {itemId ? "Edit" : "New"} {currentTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Provide accurate details and upload supporting documents.
        </p>

        {loading ? (
          <p className="text-slate-500 mt-6 text-sm">Loading details...</p>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* Qualification Form */}
            {category === "qualifications" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="degree">Degree / Qualification</label>
                    <input
                      id="degree"
                      placeholder="e.g. PG, UG, PhD Course Work, NET, GATE"
                      className={inputClass}
                      value={formState.degree}
                      onChange={(e) => handleChange("degree", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="subject">Subject / Specialization</label>
                    <input
                      id="subject"
                      placeholder="e.g. Computer Science"
                      className={inputClass}
                      value={formState.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="institution">Institution</label>
                    <input
                      id="institution"
                      placeholder="e.g. College Name"
                      className={inputClass}
                      value={formState.institution}
                      onChange={(e) => handleChange("institution", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="university">University</label>
                    <input
                      id="university"
                      placeholder="e.g. University Board"
                      className={inputClass}
                      value={formState.university}
                      onChange={(e) => handleChange("university", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="yearOfPassing">Year of Passing</label>
                    <input
                      id="yearOfPassing"
                      type="number"
                      placeholder="e.g. 2024"
                      className={inputClass}
                      value={formState.yearOfPassing}
                      onChange={(e) => handleChange("yearOfPassing", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="percentage">Percentage / CGPA</label>
                    <input
                      id="percentage"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 85.5 or 9.2"
                      className={inputClass}
                      value={formState.percentage}
                      onChange={(e) => handleChange("percentage", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="status">Status</label>
                    <select
                      id="status"
                      className={inputClass}
                      value={formState.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pursuing">Pursuing</option>
                    </select>
                  </div>
                </div>
              </>
            ) : null}

            {/* Publication Form */}
            {category === "publications" ? (
              <>
                <div>
                  <label className={labelClass} htmlFor="title">Publication Title</label>
                  <input
                    id="title"
                    placeholder="Enter full title of the paper / book chapter"
                    className={inputClass}
                    value={formState.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="authors">Authors</label>
                    <input
                      id="authors"
                      placeholder="Authors list (comma-separated)"
                      className={inputClass}
                      value={formState.authors}
                      onChange={(e) => handleChange("authors", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="journalName">Journal / Publisher Name</label>
                    <input
                      id="journalName"
                      placeholder="e.g. Springer, IEEE Transactions"
                      className={inputClass}
                      value={formState.journalName}
                      onChange={(e) => handleChange("journalName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className={labelClass} htmlFor="volume">Volume</label>
                    <input
                      id="volume"
                      placeholder="Vol. No."
                      className={inputClass}
                      value={formState.volume}
                      onChange={(e) => handleChange("volume", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="issue">Issue</label>
                    <input
                      id="issue"
                      placeholder="Issue No."
                      className={inputClass}
                      value={formState.issue}
                      onChange={(e) => handleChange("issue", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="pages">Pages</label>
                    <input
                      id="pages"
                      placeholder="e.g. 120-130"
                      className={inputClass}
                      value={formState.pages}
                      onChange={(e) => handleChange("pages", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="issnIsbn">ISSN / ISBN</label>
                    <input
                      id="issnIsbn"
                      placeholder="e.g. 1234-5678"
                      className={inputClass}
                      value={formState.issnIsbn}
                      onChange={(e) => handleChange("issnIsbn", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="publishDate">Publication Date</label>
                    <input
                      id="publishDate"
                      type="date"
                      className={inputClass}
                      value={formState.publishDate}
                      onChange={(e) => handleChange("publishDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="impactFactor">Impact Factor</label>
                    <input
                      id="impactFactor"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2.45"
                      className={inputClass}
                      value={formState.impactFactor}
                      onChange={(e) => handleChange("impactFactor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="publicationUrl">Publication URL</label>
                    <input
                      id="publicationUrl"
                      placeholder="https://..."
                      className={inputClass}
                      value={formState.publicationUrl}
                      onChange={(e) => handleChange("publicationUrl", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Indexing / Databases</label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {["Scopus", "Web of Science", "UGC CARE", "Other"].map((db) => (
                      <label key={db} className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={formState.indexing?.includes(db)}
                          onChange={(e) => handleCheckboxChange(db, e.target.checked)}
                          className="rounded border-gray-300 text-[color:var(--maroon-600)] focus:ring-[color:var(--maroon-600)]"
                        />
                        {db}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {/* Conference Form */}
            {category === "conferences" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="title">Conference Title</label>
                    <input
                      id="title"
                      placeholder="e.g. IEEE Conference on Cloud"
                      className={inputClass}
                      value={formState.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="paperTitle">Paper Title (if presented)</label>
                    <input
                      id="paperTitle"
                      placeholder="Paper title"
                      className={inputClass}
                      value={formState.paperTitle}
                      onChange={(e) => handleChange("paperTitle", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="presentationType">Presentation Type</label>
                    <select
                      id="presentationType"
                      className={inputClass}
                      value={formState.presentationType}
                      onChange={(e) => handleChange("presentationType", e.target.value)}
                    >
                      <option value="Attended Only">Attended Only</option>
                      <option value="Oral">Oral Presentation</option>
                      <option value="Poster">Poster Presentation</option>
                      <option value="Keynote">Keynote Address</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="organizer">Organizer</label>
                    <input
                      id="organizer"
                      placeholder="e.g. Department of MCA"
                      className={inputClass}
                      value={formState.organizer}
                      onChange={(e) => handleChange("organizer", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="venue">Venue / Location</label>
                    <input
                      id="venue"
                      placeholder="e.g. Chennai, India"
                      className={inputClass}
                      value={formState.venue}
                      onChange={(e) => handleChange("venue", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="startDate">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className={inputClass}
                      value={formState.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="endDate">End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      className={inputClass}
                      value={formState.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="proceedingsDetails">Proceedings / DOI Details</label>
                  <input
                    id="proceedingsDetails"
                    placeholder="Details about proceedings indexing or URL"
                    className={inputClass}
                    value={formState.proceedingsDetails}
                    onChange={(e) => handleChange("proceedingsDetails", e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {/* Patent Form */}
            {category === "patents" ? (
              <>
                <div>
                  <label className={labelClass} htmlFor="title">Patent Title</label>
                  <input
                    id="title"
                    placeholder="Title of the invention"
                    className={inputClass}
                    value={formState.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="applicationNumber">Application Number</label>
                    <input
                      id="applicationNumber"
                      placeholder="Filing app reference"
                      className={inputClass}
                      value={formState.applicationNumber}
                      onChange={(e) => handleChange("applicationNumber", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="patentStatus">Status</label>
                    <select
                      id="patentStatus"
                      className={inputClass}
                      value={formState.patentStatus}
                      onChange={(e) => handleChange("patentStatus", e.target.value)}
                    >
                      <option value="Filed">Filed</option>
                      <option value="Published">Published</option>
                      <option value="Granted">Granted</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="filingDate">Filing Date</label>
                    <input
                      id="filingDate"
                      type="date"
                      className={inputClass}
                      value={formState.filingDate}
                      onChange={(e) => handleChange("filingDate", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="publicationDate">Publication Date (if published)</label>
                    <input
                      id="publicationDate"
                      type="date"
                      className={inputClass}
                      value={formState.publicationDate}
                      onChange={(e) => handleChange("publicationDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="grantDate">Grant Date (if granted)</label>
                    <input
                      id="grantDate"
                      type="date"
                      className={inputClass}
                      value={formState.grantDate}
                      onChange={(e) => handleChange("grantDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="inventors">Inventors</label>
                    <input
                      id="inventors"
                      placeholder="Inventors list (comma-separated)"
                      className={inputClass}
                      value={formState.inventors}
                      onChange={(e) => handleChange("inventors", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="patentUrl">Patent Reference Link</label>
                    <input
                      id="patentUrl"
                      placeholder="https://..."
                      className={inputClass}
                      value={formState.patentUrl}
                      onChange={(e) => handleChange("patentUrl", e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {/* Workshop Form */}
            {category === "workshops" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="title">Workshop Title</label>
                    <input
                      id="title"
                      placeholder="Name of workshop / seminar / FDP"
                      className={inputClass}
                      value={formState.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="role">Role</label>
                    <select
                      id="role"
                      className={inputClass}
                      value={formState.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                    >
                      <option value="Attended">Attended</option>
                      <option value="Organized">Organized</option>
                      <option value="Resource Person">Resource Person</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="organizer">Organizer</label>
                    <input
                      id="organizer"
                      placeholder="e.g. AICTE, University"
                      className={inputClass}
                      value={formState.organizer}
                      onChange={(e) => handleChange("organizer", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="venue">Venue / Platform</label>
                    <input
                      id="venue"
                      placeholder="e.g. Zoom, College Campus"
                      className={inputClass}
                      value={formState.venue}
                      onChange={(e) => handleChange("venue", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="startDate">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className={inputClass}
                      value={formState.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="endDate">End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      className={inputClass}
                      value={formState.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="durationDays">Duration (Days)</label>
                    <input
                      id="durationDays"
                      type="number"
                      placeholder="No. of days"
                      className={inputClass}
                      value={formState.durationDays}
                      onChange={(e) => handleChange("durationDays", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="fundingAgency">Funding / Sponsoring Agency</label>
                  <input
                    id="fundingAgency"
                    placeholder="e.g. TEQIP, Self-funded"
                    className={inputClass}
                    value={formState.fundingAgency}
                    onChange={(e) => handleChange("fundingAgency", e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {/* Membership Form */}
            {category === "memberships" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="professionalBody">Professional Body</label>
                    <input
                      id="professionalBody"
                      placeholder="e.g. IEEE, ACM, CSI"
                      className={inputClass}
                      value={formState.professionalBody}
                      onChange={(e) => handleChange("professionalBody", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="membershipNumber">Membership Number</label>
                    <input
                      id="membershipNumber"
                      placeholder="Register/card ID"
                      className={inputClass}
                      value={formState.membershipNumber}
                      onChange={(e) => handleChange("membershipNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="membershipType">Membership Type / Grade</label>
                  <input
                    id="membershipType"
                    placeholder="e.g. Life Member, Student Member"
                    className={inputClass}
                    value={formState.membershipType}
                    onChange={(e) => handleChange("membershipType", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="startDate">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className={inputClass}
                      value={formState.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="expiryDate">Expiry Date (optional)</label>
                    <input
                      id="expiryDate"
                      type="date"
                      className={inputClass}
                      value={formState.expiryDate}
                      onChange={(e) => handleChange("expiryDate", e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {/* Scholarship Form */}
            {category === "scholarships" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">Fellowship / Scholarship Name</label>
                    <input
                      id="name"
                      placeholder="e.g. JRF, SRF, Merit Stipend"
                      className={inputClass}
                      value={formState.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="sponsoringAgency">Sponsoring Agency</label>
                    <input
                      id="sponsoringAgency"
                      placeholder="e.g. UGC, CSIR, DST"
                      className={inputClass}
                      value={formState.sponsoringAgency}
                      onChange={(e) => handleChange("sponsoringAgency", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="amountPerMonth">Amount per Month (₹)</label>
                    <input
                      id="amountPerMonth"
                      type="number"
                      placeholder="Monthly amount"
                      className={inputClass}
                      value={formState.amountPerMonth}
                      onChange={(e) => handleChange("amountPerMonth", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="scholarshipStatus">Status</label>
                    <select
                      id="scholarshipStatus"
                      className={inputClass}
                      value={formState.scholarshipStatus}
                      onChange={(e) => handleChange("scholarshipStatus", e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="startDate">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className={inputClass}
                      value={formState.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="endDate">End Date (optional)</label>
                  <input
                    id="endDate"
                    type="date"
                    className={inputClass}
                    value={formState.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {/* Document upload is common to all */}
            <div>
              <label className={labelClass} htmlFor="file">
                Upload Certificate / Proof (PDF/Image)
              </label>
              <input
                id="file"
                type="file"
                className={inputClass}
                onChange={(e) => handleChange("file", e.target.files?.[0] ?? null)}
              />
              {itemId ? (
                <p className="text-xs text-slate-400 mt-1">
                  Leave empty if you do not want to replace the current certificate file.
                </p>
              ) : null}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[color:var(--maroon-800)] hover:bg-[color:var(--maroon-900)] px-6 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200"
              >
                {saving ? "Saving..." : "Save Details"}
              </button>
              <Link
                href={`/scholar/portfolio/${category}`}
                className="rounded-full border border-[color:var(--border)] px-6 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
          </form>
        )}
      </section>
    </PageLayout>
  );
}

export default function ScholarPortfolioFormPage() {
  return (
    <React.Suspense fallback={<p className="text-slate-500 text-sm p-6">Loading form...</p>}>
      <ScholarPortfolioFormContent />
    </React.Suspense>
  );
}
