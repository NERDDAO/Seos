import { useState } from 'react';

export default function SetupPage() {

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center min-h-screen py-2"
      >
        <div
          className="text-2xl font-bold text-center align-middle mb-4"
        >Setup Page</div>
        <ul
          className="list-disc list-inside"
        >
          <span
            className="font-bold text-lg text-center align-middle"
          >Todo List</span>
          <li> Setup Info: Fetch on chain data for active setup</li>
          <li> Graph Query: Redeploy graph and fetch active positions</li>
          <li> Add Liquidity function []</li>
          <li> Remove Liquidity function []</li>
          <li> Claim FUnction []</li>
        </ul></div>

    </div>
  )
}
