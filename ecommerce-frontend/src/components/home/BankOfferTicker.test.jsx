import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BankOfferTicker from './BankOfferTicker';

describe('BankOfferTicker UI Component', () => {
  it('renders the initial bank offer cleanly', () => {
    render(<BankOfferTicker />);
    expect(screen.getByText('RIGAMART10')).toBeInTheDocument();
    expect(screen.getByText('BANK OFFER')).toBeInTheDocument();
  });

  it('renders deliver-to metro location info badge', () => {
    render(<BankOfferTicker />);
    expect(screen.getByText(/Deliver to/i)).toBeInTheDocument();
  });
});
