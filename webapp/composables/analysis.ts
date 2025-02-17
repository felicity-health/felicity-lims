import Swal from 'sweetalert2';
import { IAnalysisResult } from '@/models/analysis';
import { useSampleStore } from '@/stores/sample';
import { useWorksheetStore } from '@/stores/worksheet';

import useApiUtil from './api_util';
import useNotifyToast from './alert_toast';
import { CancelAnalysisResultsDocument, CancelAnalysisResultsMutation, CancelAnalysisResultsMutationVariables, ReInstateAnalysisResultsDocument, ReInstateAnalysisResultsMutation, ReInstateAnalysisResultsMutationVariables, RetestAnalysisResultsDocument, RetestAnalysisResultsMutation, RetestAnalysisResultsMutationVariables, RetractAnalysisResultsDocument, RetractAnalysisResultsMutation, RetractAnalysisResultsMutationVariables, SubmitAnalysisResultsDocument, SubmitAnalysisResultsMutation, SubmitAnalysisResultsMutationVariables, VerifyAnalysisResultsDocument, VerifyAnalysisResultsMutation, VerifyAnalysisResultsMutationVariables } from '@/graphql/operations/analyses.mutations';

export default function useAnalysisComposable() {
    const sampleStore = useSampleStore();
    const worksheetStore = useWorksheetStore();
    const { withClientMutation } = useApiUtil();
    const { toastInfo } = useNotifyToast();

    // Cancell Analyses
    const cancelResults = async (uids: string[]) => {
        try {
            await Swal.fire({
                title: 'Are you sure?',
                text: 'You want to cancel these analytes',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, cancel now!',
                cancelButtonText: 'No, do not cancel!',
            }).then(async result => {
                if (result.isConfirmed) {
                    withClientMutation<CancelAnalysisResultsMutation, CancelAnalysisResultsMutationVariables>(CancelAnalysisResultsDocument, { analyses: uids }, 'cancelAnalysisResults').then(resp => {
                        sampleStore.updateAnalysesResultsStatus(resp.results);
                        worksheetStore.updateWorksheetResultsStatus(resp.results);
                    });
                }
            });
        } catch (error) {}
    };

    // Reinstate Analyses
    const reInstateResults = async (uids: string[]) => {
        try {
            await Swal.fire({
                title: 'Are you sure?',
                text: 'You want to reinstate analystes',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, reinstate now!',
                cancelButtonText: 'No, do not reinstate!',
            }).then(async result => {
                if (result.isConfirmed) {
                    withClientMutation<ReInstateAnalysisResultsMutation, ReInstateAnalysisResultsMutationVariables>(ReInstateAnalysisResultsDocument, { analyses: uids }, 'reInstateAnalysisResults').then(resp => {
                        sampleStore.updateAnalysesResultsStatus(resp.results);
                        worksheetStore.updateWorksheetResultsStatus(resp.results);
                    });
                }
            });
        } catch (error) {}
    };

    // Submit Analyses
    function submitResult(result: IAnalysisResult): void {
        if (result.status !== 'pending') return;
        result.result = result.editResult;
        withClientMutation<SubmitAnalysisResultsMutation, SubmitAnalysisResultsMutationVariables>(SubmitAnalysisResultsDocument, [{ uid: result.uid, result: result.result }], 'submitAnalysisResults').then(resp => {
            toastInfo(resp.message);
            sampleStore.backgroundProcessing([{ uid: result.uid, result: result.result }], undefined, 'submitting');
            worksheetStore.backgroundProcessing([{ uid: result.uid, result: result.result }], undefined, 'submitting');
        });
    }

    const submitResults = async (results: any[], sourceObject: string, sourceObjectUid: string) => {
        try {
            await Swal.fire({
                title: 'Are you sure?',
                text: 'You want to submit these results',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, submit now!',
                cancelButtonText: 'No, cancel submission!',
            }).then(async result => {
                if (result.isConfirmed) {
                    withClientMutation<SubmitAnalysisResultsMutation, SubmitAnalysisResultsMutationVariables>(
                        SubmitAnalysisResultsDocument,
                        { analysisResults: results, sourceObject, sourceObjectUid },
                        'submitAnalysisResults'
                    ).then(resp => {
                        toastInfo(resp.message);
                        sampleStore.backgroundProcessing(results, sourceObject === 'sample' ? sourceObjectUid : undefined, 'submitting');
                        worksheetStore.backgroundProcessing(
                            results,
                            sourceObject === 'worksheet' ? sourceObjectUid : undefined,
                            'submitting'
                        );
                    });
                }
            });
        } catch (error) {}
    };

    // Approve Analyses
    const approveResults = async (uids: string[], sourceObject: string, sourceObjectUid: string) => {
        try {
            await Swal.fire({
                title: 'Are you sure?',
                text: 'You want to approve these results',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, approve now!',
                cancelButtonText: 'No, cancel approval!',
            }).then(async result => {
                if (result.isConfirmed) {
                    withClientMutation<VerifyAnalysisResultsMutation, VerifyAnalysisResultsMutationVariables>(
                        VerifyAnalysisResultsDocument,
                        { analyses: uids, sourceObject, sourceObjectUid },
                        'verifyAnalysisResults'
                    ).then(resp => {
                        toastInfo(resp.message);
                        const data = uids.map(item => ({ uid: item }));
                        sampleStore.backgroundProcessing(data, sourceObject === 'sample' ? sourceObjectUid : undefined, 'approving');
                        worksheetStore.backgroundProcessing(data, sourceObject === 'worksheet' ? sourceObjectUid : undefined, 'approving');
                    });
                }
            });
        } catch (error) {}
    };

    // Retract Analyses
    const retractResults = async (uids: string[]) => {
        try {
            await Swal.fire({
                title: 'Are you sure?',
                text: 'You want to retract these results',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, retract now!',
                cancelButtonText: 'No, cancel retraction!',
            }).then(async result => {
                if (result.isConfirmed) {
                    withClientMutation<RetractAnalysisResultsMutation,RetractAnalysisResultsMutationVariables>(RetractAnalysisResultsDocument, { analyses: uids }, 'retractAnalysisResults').then(resp => {
                        sampleStore.updateAnalysesResults(resp.results);
                        worksheetStore.updateWorksheetResultsStatus(resp.results);
                    });
                }
            });
        } catch (error) {}
    };

    // Retest Analyses
    const retestResults = async (uids: string[]) => {
        try {
            await Swal.fire({
                title: 'Are you sure?',
                text: 'You want to retest these results',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, retest now!',
                cancelButtonText: 'No, cancel retesting!',
            }).then(async result => {
                if (result.isConfirmed) {
                    withClientMutation<RetestAnalysisResultsMutation, RetestAnalysisResultsMutationVariables>(RetestAnalysisResultsDocument, { analyses: uids }, 'retestAnalysisResults').then(resp =>
                        sampleStore.updateAnalysesResults(resp.results)
                    );
                }
            });
        } catch (error) {}
    };

    return {
        submitResult,
        submitResults,
        cancelResults,
        reInstateResults,
        approveResults,
        retractResults,
        retestResults,
    };
}
