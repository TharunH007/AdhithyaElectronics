import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Message from '../components/Message';
import Rating from '../components/Rating';
import React from 'react';

describe('Message Component', () => {
    it('should render children correctly', () => {
        render(<Message>Test Message</Message>);
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
        const { container } = render(<Message variant="danger">Error</Message>);
        expect(container.firstChild).toHaveClass('bg-red-100');
    });
});

describe('Rating Component', () => {
    it('should render correct number of stars', () => {
        const { container } = render(<Rating value={3.5} text="10 reviews" />);
        // There should be 5 star icons in total
        const stars = container.querySelectorAll('svg');
        expect(stars.length).toBe(5);
    });

    it('should render the text correctly', () => {
        render(<Rating value={4} text="5 reviews" />);
        expect(screen.getByText('5 reviews')).toBeInTheDocument();
    });
});
