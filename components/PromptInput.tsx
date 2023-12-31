"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import fetchImages from "../lib/fetchImages";
import fetchSuggestionFromChatGPT from "../lib/fetchSuggestionFromChatGPT";
import toast from "react-hot-toast";

function PromptInput() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // const {
  //   data: suggestion,
  //   isLoading,
  //   mutate,
  //   isValidating,
  // } = useSWR("suggestion", fetchSuggestionFromChatGPT, {
  //   revalidateOnFocus: false,
  // });

  const getNewSuggestion = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:7071/api/getChatGPTSuggestion");
      const data = await res.text();
      setSuggestion(data.trim());
      setInput(suggestion); // Assuming your suggestion is in the 'suggestion' key
      setIsLoading(false);
      setIsValidating(false);
    } catch (err) {
      console.error("An error occurred:", err);
      setIsLoading(false);
    }
  };

  const { mutate: updateImages } = useSWR("images", fetchImages, {
    revalidateOnFocus: false,
  });

  const submitPrompt = async (useSuggestion?: boolean) => {
    const inputPrompt = input;
    setInput("");

    const notificationPrompt = inputPrompt || suggestion;
    const notificationPromptShort = notificationPrompt.slice(0, 20);

    const notification = toast.loading(
      `DALL·E is creating: ${notificationPromptShort}...`
    );

    const p = useSuggestion
      ? suggestion
      : inputPrompt || (!isLoading && !isValidating && suggestion);
    try {
      const res = await fetch("http://localhost:7071/api/generateImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: p,
        }),
      });
      setIsLoading(false);

      if (res.ok) {
        toast.dismiss(notification);
        toast.success("Image generation successful!");
        updateImages();
      } else {
        toast.dismiss(notification);
        toast.error("Image generation failed!");
      }
    } catch (err) {
      console.error("An error occurred:", err);
      setIsLoading(false);
    }
    //updateImages();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await submitPrompt();
  };

  const loading = isValidating || isLoading;

  return (
    <div className="m-10">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row shadow-md shadow-slate-400/10 border rounded-md lg:divide-x"
      >
        <textarea
          placeholder={
            (loading && "ChatGPT is thinking of a suggestion...") ||
            suggestion ||
            "Enter a prompt..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-4 outline-none rounded-md"
        />
        <button
          className={`p-4 ${
            input
              ? "bg-violet-500 text-white transition-colors duration-200"
              : "text-gray-300 cursor-not-allowed"
          } font-bold`}
          type="submit"
          disabled={!input}
        >
          Generate
        </button>
        <button
          className={`p-4 bg-violet-400 text-white transition-colors duration-200 font-bold disabled:text-gray-300 disabled:cursor-not-allowed disabled:bg-gray-400`}
          onClick={() => submitPrompt(true)}
          disabled={isLoading || isValidating}
          type="button"
        >
          Use Suggestion
        </button>
        <button
          className={`p-4 bg-white text-violet-500 border-none transition-colors duration-200 rounded-b-md md:rounded-r-md md:rounded-bl-none font-bold`}
          onClick={() => getNewSuggestion()}
          type="button"
        >
          New Suggestion
        </button>
      </form>

      {input && (
        <p className="italic pt-2 pl-2 font-light">
          Suggestion:{" "}
          <span className="text-violet-500">
            {loading ? "ChatGPT is thinking..." : suggestion}
          </span>
        </p>
      )}
    </div>
  );
}

export default PromptInput;
