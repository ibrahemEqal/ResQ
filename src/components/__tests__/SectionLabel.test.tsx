import React from 'react';
import { render } from '@testing-library/react-native';
import { SectionLabel } from '@/app/report/index';

describe('SectionLabel Component', () => {
    it('renders the title correctly', () => {
        const { getByText } = render(<SectionLabel title="نوع البلاغ" icon="grid" />);
        expect(getByText('نوع البلاغ')).toBeTruthy();
    });

    it('shows asterisk when required is true', () => {
        const { getByText } = render(<SectionLabel title="الوصف" icon="create" required />);
        expect(getByText('*')).toBeTruthy();
    });
});