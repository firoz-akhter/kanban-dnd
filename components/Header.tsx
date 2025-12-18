"use client";

import Image from "next/image";
import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Avatar from "react-avatar";
// import { useBoardStore } from "@/store/BoardStore";
import { useEffect, useState } from "react";
// import fetchSuggestion from "@/lib/fetchSuggestion";

function Header({ filterBoardBySearchText }) {
  // const [board, searchString, setSearchString] = useBoardStore((state) => [
  //   state.board,
  //   state.searchString,
  //   state.setSearchString,
  // ]);

  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<any[]>([]);

  // useEffect(() => {
  //   if (board.columns.size === 0) return;
  //   setLoading(true);
  //   const fetchSuggestionFunc = async () => {
  //     const suggestion = await fetchSuggestion(board);
  //     setSuggestion(suggestion);
  //     setLoading(false);
  //   };

  //   setTimeout(() => {
  //     fetchSuggestionFunc();
  //   }, 3000);
  // }, [board]);

  // const handleSearch = (e: any) => {
  //   setSearchText(e.target.value);
  //   console.log("text,,", searchText);
  //   filterBoardBySearchText(searchText);
  // };

  useEffect(() => {
    // console.log("text,,,", searchText);
    filterBoardBySearchText(searchText);
  }, [searchText]);

  return (
    <header className="sticky z-20 top-0 mb-20 left-0">
      <div className="flex flex-col md:flex-row items-center p-2 bg-gray-500/10 rounded-b-2xl">
        <Image
          src="https://links.papareact.com/c2cdd5"
          alt="Trello logo"
          width={300}
          height={100}
          className="w-44 md:w-56 pb-10 md:pb-0 object-contain"
        />
        <div className="flex items-center space-x-5 flex-1 justify-end w-full">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("searchText", searchText);
            }}
            className="flex items-center space-x-5 bg-white rounded-md p-2 shadow-md flex-1 md:flex-initial"
          >
            <SearchIcon className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 focus:outline-0"
            />
            <button type="submit" hidden>
              Search
            </button>
          </form>
          <Avatar name="Frz" round size="50" color="#0055D1" />
        </div>
      </div>
    </header>
  );
}

export default Header;
