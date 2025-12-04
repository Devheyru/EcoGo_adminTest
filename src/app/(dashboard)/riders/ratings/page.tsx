"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Rating } from "../../../../types/ratings";
import { allRatings, ROWS_PER_PAGE } from "../../../../lib/ratingsData";
import { Trash2 } from "lucide-react";

// --- Utility Functions ---

// Function to generate Star HTML using Font Awesome icons (or Unicode stars)
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => {
      const isFilled = i < rating;
      return (
        <span
          key={i}
          className={isFilled ? "text-yellow-400" : "text-gray-300"}
        >
          &#9733; {/* Unicode Star */}
        </span>
      );
    });
  return <div className="inline-flex space-x-0.5">{stars}</div>;
};

// --- Main Component ---

const DriverRatingsPage: React.FC = () => {
  // State for filtering
  const [driverNameFilter, setDriverNameFilter] =
    useState<string>("DriverTest"); // Hardcoded initial value
  const [minRatingFilter, setMinRatingFilter] = useState<string>("4"); // Hardcoded initial value

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1. Filtering Logic (memoized for performance)
  const filteredRatings = useMemo(() => {
    const minRating = parseInt(minRatingFilter);
    const nameQuery = driverNameFilter.toLowerCase().trim();

    return allRatings.filter((rating) => {
      const matchesName =
        rating.ratedFor.toLowerCase().includes(nameQuery) ||
        rating.ratedBy.toLowerCase().includes(nameQuery);
      const meetsMinRating = isNaN(minRating) || rating.rating >= minRating;
      return matchesName && meetsMinRating;
    });
  }, [driverNameFilter, minRatingFilter]);

  // 2. Pagination Calculation
  const totalPages = Math.ceil(filteredRatings.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;

  // 3. Ratings for the Current Page
  const paginatedRatings = useMemo(() => {
    return filteredRatings.slice(startIndex, endIndex);
  }, [filteredRatings, startIndex, endIndex]);

  // Reset page to 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [driverNameFilter, minRatingFilter]);

  // Action handler
  const handleDelete = useCallback((id: number) => {
    alert(
      `Simulating deletion of rating ID: ${id}. In a real application, a state update or API call would be made here.`
    );
  }, []);

  // Pagination handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleClear = () => {
    setDriverNameFilter("");
    setMinRatingFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header and Breadcrumb (Simplified) */}
      <h1 className="text-2xl font-bold text-white bg-black mb-2 rounded px-1">
        Riders Ratings
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Home / Ride ratings / Rider ratings
      </p>

      {/* --- Search/Filter Card --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Search & Filter Ratings
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Hardcoded Driver Name Input */}
          <div className="flex-grow w-full">
            <label
              htmlFor="driverName"
              className="block text-sm font-medium text-gray-700"
            >
              Riders Name
            </label>
            <input
              type="text"
              id="driverName"
              value={driverNameFilter}
              onChange={(e) => setDriverNameFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-gray-100"
              placeholder="Enter driver's name"
            />
          </div>

          {/* Hardcoded Rating Input (Example: Filter by Rating) */}
          <div className="w-full sm:w-auto">
            <label
              htmlFor="minRating"
              className="block text-sm font-medium text-gray-700"
            >
              Min Rating
            </label>
            <select
              id="minRating"
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-gray-100"
            >
              <option value="">All</option>
              <option value="4">4 Stars & Up</option>
              <option value="5">5 Stars Only</option>
            </select>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            {/* Search button behavior is implicit with state changes */}
            <button className="w-full sm:w-auto px-4 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
              Search
            </button>
            <button
              onClick={handleClear}
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-150 shadow-md"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* --- Driver Ratings List Table --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white bg-black rounded px-1 mb-4">
          Driver Ratings List (Page {currentPage} of {totalPages})
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sr. no
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rated by
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rated for
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rating
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rated on
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRatings.length > 0 ? (
                paginatedRatings.map((rating, index) => (
                  <tr
                    key={rating.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rating.ratedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rating.ratedFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <StarRating rating={rating.rating} /> ({rating.rating})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rating.ratedOn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleDelete(rating.id)}
                        className="text-red-600 hover:text-red-900 font-medium bg-red-50 px-3 py-1 rounded-md transition duration-150"
                      >
                      <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No ratings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Controls --- */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            {filteredRatings.length > 0
              ? `Showing ${startIndex + 1} to ${Math.min(
                  endIndex,
                  filteredRatings.length
                )} of ${filteredRatings.length} entries`
              : "0 entries"}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverRatingsPage;
