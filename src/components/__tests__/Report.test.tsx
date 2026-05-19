import React from 'react';
import { render } from '@testing-library/react-native';
import { SectionLabel } from '@/app/report/index';

describe('Emergency Report Components', () => {

    it('يجب أن يظهر عنوان القسم بشكل صحيح', () => {
        const testTitle = "نوع الطارئ";
        const { getByText } = render(
            <SectionLabel title={testTitle} icon="grid" />
        );

        expect(getByText(testTitle)).toBeTruthy();
    });

    it('يجب أن تظهر علامة النجمة عند تحديد الحقل كمطلوب', () => {
        const { getByText } = render(
            <SectionLabel title="وصف الحادث" icon="create" required={true} />
        );

        expect(getByText('*')).toBeTruthy();
    });

});