import { __ } from '@wordpress/i18n';
import { PluginSidebar } from '@wordpress/editor';
import {
    PanelBody,
    Button,
    Spinner,
    Panel,
    PanelRow,
} from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

// Configure apiFetch to use the nonce for authentication
if ( window.wegeniusAdmin && window.wegeniusAdmin.nonce ) {
    apiFetch.use( apiFetch.createNonceMiddleware( window.wegeniusAdmin.nonce ) );
}

const WeGeniusActionsSidebar = () => {
    const [ isScanning, setIsScanning ] = useState( false );
    const [ scanResult, setScanResult ] = useState( null );
    const [ scanStatus, setScanStatus ] = useState( null );
    const [ isCheckingStatus, setIsCheckingStatus ] = useState( false );
    const [ isInitialLoading, setIsInitialLoading ] = useState( true );
    const [ allAnalysisTypes, setAllAnalysisTypes ] = useState( {} );
    const [ scanningType, setScanningType ] = useState( null );

    // Get current post data
    const { 
        postId, 
        postTitle, 
        postContent, 
        postPermalink, 
        featuredImageUrl, 
        postStatus, 
        authorName, 
        categories, 
        tags, 
        excerpt 
    } = useSelect( ( select ) => {
        const { getCurrentPost } = select( 'core/editor' );
        const { getEntityRecord, getMedia } = select( 'core' );
        const { getCurrentUser } = select( 'core' );
        const post = getCurrentPost();
        
        // Get post data from the editor
        const postData = getEntityRecord( 'postType', 'post', post?.id );
        
        // Get featured image
        const featuredImageId = postData?.featured_media;
        const featuredImage = featuredImageId ? getMedia( featuredImageId ) : null;
        
        // Get author data
        const authorId = postData?.author;
        const author = authorId ? getEntityRecord( 'root', 'user', authorId ) : null;
        
        // Get categories - use stable references
        const categoryIds = postData?.categories || [];
        const categoryData = categoryIds.map( id => getEntityRecord( 'taxonomy', 'category', id ) ).filter( Boolean );
        const categoryNames = categoryData.map( cat => cat.name ).filter( Boolean );
        
        // Get tags - use stable references
        const tagIds = postData?.tags || [];
        const tagData = tagIds.map( id => getEntityRecord( 'taxonomy', 'post_tag', id ) ).filter( Boolean );
        const tagNames = tagData.map( tag => tag.name ).filter( Boolean );
        
        return {
            postId: post?.id,
            postTitle: post?.title || postData?.title?.rendered || '',
            postContent: post?.content || postData?.content?.rendered || '',
            postPermalink: postData?.link || '',
            featuredImageUrl: featuredImage?.source_url || '',
            postStatus: postData?.status || 'draft',
            authorName: author?.name || '',
            categories: categoryNames,
            tags: tagNames,
            excerpt: postData?.excerpt?.rendered || '',
        };
    }, [] ); // Add empty dependency array to prevent unnecessary re-renders

    // Automatically check scan status and fetch analysis types when component mounts
    useEffect( () => {
        if ( postId ) {
            checkScanStatus( true );
            fetchAllAnalysisTypes();
        }
    }, [ postId ] );

    // Check scan status for current post
    const checkScanStatus = async ( isInitialLoad = false ) => {
        if ( ! postId ) {
            return;
        }

        if ( isInitialLoad ) {
            setIsInitialLoading( true );
        } else {
            setIsCheckingStatus( true );
        }
        
        try {
            const response = await apiFetch( {
                path: `/wegenius/v1/analysis/status/${ postId }`,
                method: 'GET',
            } );

            setScanStatus( response );
        } catch ( error ) {
            console.error( 'Error checking scan status:', error );
            setScanStatus( null );
        } finally {
            if ( isInitialLoad ) {
                setIsInitialLoading( false );
            } else {
                setIsCheckingStatus( false );
            }
        }
    };

    const fetchAllAnalysisTypes = async () => {
        if ( ! postId ) {
            return;
        }

        try {
            const response = await apiFetch( {
                path: `/wegenius/v1/analysis/types/${ postId }`,
                method: 'GET',
            } );

            setAllAnalysisTypes( response );
        } catch ( error ) {
            console.error( 'Failed to fetch analysis types:', error );
        }
    };

    const handleScan = async ( analysisType ) => {
        if ( ! postId ) {
            console.error( 'No post ID available' );
            return;
        }

        setIsScanning( true );
        setScanningType( analysisType );
        setScanResult( null );

        try {
            // Prepare the request data according to the API spec
            const requestData = {
                wp_post_id: postId,
                title: postTitle || '',
                content: postContent || '',
                permalink: postPermalink || '',
                featured_image: featuredImageUrl || '',
                status: postStatus === 'publish' ? 'published' : ( postStatus || 'draft' ),
                published_at: new Date().toISOString(),
                author_name: authorName || '',
                action_type: analysisType,
                meta_data: {
                    categories: categories || [],
                    tags: tags || [],
                    excerpt: excerpt || '',
                }
            };

            // Send request to WeGenius API
            const response = await apiFetch( {
                path: '/wegenius/v1/scan',
                method: 'POST',
                data: requestData,
            } );

            setScanResult( {
                success: true,
                data: response,
                message: __( 'Analysis submitted successfully!', 'wegenius' )
            } );

            // Update all analysis types from response
            if ( response.all_analysis_types ) {
                setAllAnalysisTypes( response.all_analysis_types );
            }

            // Check status after successful submission
            setTimeout( () => {
                checkScanStatus();
                fetchAllAnalysisTypes();
            }, 1000 );

        } catch ( error ) {
            console.error( 'Scan error:', error );
            setScanResult( {
                success: false,
                error: error.message || __( 'Failed to submit for analysis', 'wegenius' )
            } );
        } finally {
            setIsScanning( false );
            setScanningType( null );
        }
    };

    // Helper function to get analysis results for a specific type
    const getAnalysisResults = ( type ) => {
        if ( ! scanStatus?.analysis?.results ) return null;
        
        switch ( type ) {
            case 'gaps':
                return scanStatus.analysis.results.gaps;
            case 'improve':
                return scanStatus.analysis.results.improvements;
            case 'ideas':
                return scanStatus.analysis.results.ideas;
            default:
                return null;
        }
    };

    // Helper function to get status for a specific analysis type
    const getAnalysisStatus = ( type ) => {
        if ( allAnalysisTypes[ type ] ) {
            return allAnalysisTypes[ type ].status;
        }
        return scanStatus?.analysis?.status || 'unknown';
    };

    // Helper function to get status icon and color
    const getStatusConfig = ( status ) => {
        const configs = {
            completed: { icon: '✅', color: '#28a745' },
            processing: { icon: '🔄', color: '#007cba' },
            pending: { icon: '⏳', color: '#ffc107' },
            failed: { icon: '❌', color: '#dc3545' },
            unknown: { icon: '❓', color: '#6c757d' }
        };
        return configs[ status ] || configs.unknown;
    };

    return (
        <PluginSidebar
            name="wegenius-actions-sidebar"
            title={ __( 'weGenius Actions', 'wegenius' ) }
            icon={ 'smiley' }
        >
            <PanelBody>
                {/* Global Status and Controls */}
                { scanResult && (
                    <div style={{ 
                        marginBottom: '1rem', 
                        padding: '0.75rem',
                        backgroundColor: scanResult.success ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${ scanResult.success ? '#c3e6cb' : '#f5c6cb' }`,
                        borderRadius: '0.25rem',
                        color: scanResult.success ? '#155724' : '#721c24'
                    }}>
                        { scanResult.success ? (
                            <p style={{ margin: 0 }}>
                                ✅ { scanResult.message }
                            </p>
                        ) : (
                            <p style={{ margin: 0 }}>
                                ❌ { scanResult.error }
                            </p>
                        ) }
                    </div>
                ) }

                { postId && (
                    <PanelRow>
                        <Button 
                            variant="secondary" 
                            onClick={ checkScanStatus }
                            disabled={ isCheckingStatus }
                            style={{ width: '100%' }}
                        >
                            { isCheckingStatus ? (
                                <>
                                    <Spinner />
                                    { __( 'Checking Status...', 'wegenius' ) }
                                </>
                            ) : (
                                __( 'Check Status', 'wegenius' )
                            ) }
                        </Button>
                    </PanelRow>
                ) }

                { isInitialLoading && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        textAlign: 'center'
                    }}>
                        <Spinner />
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                            { __( 'Loading analysis results...', 'wegenius' ) }
                        </p>
                    </div>
                ) }

                {/* Gaps Panel */}
                <Panel title={ __( 'Content Gaps', 'wegenius' ) }>
                    <PanelRow>
                        <div style={{ width: '100%' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ 
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    { __( 'Content Gap Analysis', 'wegenius' ) }
                                </span>
                                <span style={{ 
                                    fontSize: '0.8rem',
                                    color: getStatusConfig( getAnalysisStatus( 'gaps' ) ).color
                                }}>
                                    { getStatusConfig( getAnalysisStatus( 'gaps' ) ).icon }
                                </span>
                            </div>
                            
                            <Button 
                                variant="primary" 
                                onClick={ () => handleScan( 'gaps' ) }
                                disabled={ isScanning || ! postId }
                                style={{ width: '100%' }}
                            >
                                { isScanning && scanningType === 'gaps' ? (
                                    <>
                                        <Spinner />
                                        { __( 'Analyzing Gaps...', 'wegenius' ) }
                                    </>
                                ) : (
                                    __( 'Analyze Content Gaps', 'wegenius' )
                                ) }
                            </Button>
                        </div>
                    </PanelRow>

                    { getAnalysisResults( 'gaps' ) && (
                        <PanelRow>
                            <div style={{ width: '100%' }}>
                                <h4 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    fontSize: '0.85rem',
                                    color: '#d63384'
                                }}>
                                    { __( 'Identified Gaps', 'wegenius' ) } ({ getAnalysisResults( 'gaps' ).gaps?.length || 0 })
                                </h4>
                                
                                { getAnalysisResults( 'gaps' ).gaps?.map( ( gap, index ) => (
                                    <div key={ index } style={{ 
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '0.25rem'
                                    }}>
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            color: '#0073aa',
                                            marginBottom: '0.25rem'
                                        }}>
                                            { gap.title || gap.type || __( 'Content Gap', 'wegenius' ) }
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#1d2327',
                                            lineHeight: '1.4'
                                        }}>
                                            { gap.description || __( 'This area needs attention.', 'wegenius' ) }
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </PanelRow>
                    ) }
                </Panel>

                {/* Improve Panel */}
                <Panel title={ __( 'Content Improvements', 'wegenius' ) }>
                    <PanelRow>
                        <div style={{ width: '100%' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ 
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    { __( 'Content Improvement Analysis', 'wegenius' ) }
                                </span>
                                <span style={{ 
                                    fontSize: '0.8rem',
                                    color: getStatusConfig( getAnalysisStatus( 'improve' ) ).color
                                }}>
                                    { getStatusConfig( getAnalysisStatus( 'improve' ) ).icon }
                                </span>
                            </div>
                            
                            <Button 
                                variant="primary" 
                                onClick={ () => handleScan( 'improve' ) }
                                disabled={ isScanning || ! postId }
                                style={{ width: '100%' }}
                            >
                                { isScanning && scanningType === 'improve' ? (
                                    <>
                                        <Spinner />
                                        { __( 'Analyzing Improvements...', 'wegenius' ) }
                                    </>
                                ) : (
                                    __( 'Analyze Improvements', 'wegenius' )
                                ) }
                            </Button>
                        </div>
                    </PanelRow>

                    { getAnalysisResults( 'improve' ) && (
                        <PanelRow>
                            <div style={{ width: '100%' }}>
                                <h4 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    fontSize: '0.85rem',
                                    color: '#00a32a'
                                }}>
                                    { __( 'Improvement Suggestions', 'wegenius' ) } ({ getAnalysisResults( 'improve' ).length || 0 })
                                </h4>
                                
                                { getAnalysisResults( 'improve' ).map( ( improvement, index ) => (
                                    <div key={ index } style={{ 
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#f0f8f0',
                                        border: '1px solid #c3e6cb',
                                        borderRadius: '0.25rem'
                                    }}>
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            color: '#0073aa',
                                            marginBottom: '0.25rem'
                                        }}>
                                            { improvement.title || improvement.type || __( 'Improvement', 'wegenius' ) }
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#1d2327',
                                            lineHeight: '1.4'
                                        }}>
                                            { improvement.description || __( 'Good practice identified.', 'wegenius' ) }
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </PanelRow>
                    ) }
                </Panel>

                {/* Ideas Panel */}
                <Panel title={ __( 'Content Ideas', 'wegenius' ) }>
                    <PanelRow>
                        <div style={{ width: '100%' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ 
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    { __( 'Content Ideas Analysis', 'wegenius' ) }
                                </span>
                                <span style={{ 
                                    fontSize: '0.8rem',
                                    color: getStatusConfig( getAnalysisStatus( 'ideas' ) ).color
                                }}>
                                    { getStatusConfig( getAnalysisStatus( 'ideas' ) ).icon }
                                </span>
                            </div>
                            
                            <Button 
                                variant="primary" 
                                onClick={ () => handleScan( 'ideas' ) }
                                disabled={ isScanning || ! postId }
                                style={{ width: '100%' }}
                            >
                                { isScanning && scanningType === 'ideas' ? (
                                    <>
                                        <Spinner />
                                        { __( 'Generating Ideas...', 'wegenius' ) }
                                    </>
                                ) : (
                                    __( 'Generate Content Ideas', 'wegenius' )
                                ) }
                            </Button>
                        </div>
                    </PanelRow>

                    { getAnalysisResults( 'ideas' ) && (
                        <PanelRow>
                            <div style={{ width: '100%' }}>
                                <h4 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    fontSize: '0.85rem',
                                    color: '#6f42c1'
                                }}>
                                    { __( 'Content Ideas', 'wegenius' ) } ({ getAnalysisResults( 'ideas' ).length || 0 })
                                </h4>
                                
                                { getAnalysisResults( 'ideas' ).map( ( idea, index ) => (
                                    <div key={ index } style={{ 
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#f8f5ff',
                                        border: '1px solid #d1c4e9',
                                        borderRadius: '0.25rem'
                                    }}>
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            color: '#0073aa',
                                            marginBottom: '0.25rem'
                                        }}>
                                            { idea.title || idea.type || __( 'Content Idea', 'wegenius' ) }
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#1d2327',
                                            lineHeight: '1.4'
                                        }}>
                                            { idea.description || __( 'New content opportunity identified.', 'wegenius' ) }
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </PanelRow>
                    ) }
                </Panel>

                {/* Scores Panel */}
                { scanStatus?.analysis?.scores && scanStatus.analysis.status === 'completed' && (
                    <Panel title={ __( 'Analysis Scores', 'wegenius' ) }>
                        <PanelRow>
                            <div style={{ width: '100%' }}>
                                <div style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                    gap: '0.5rem'
                                }}>
                                    { Object.entries( scanStatus.analysis.scores ).map( ( [ key, value ] ) => {
                                        const score = typeof value === 'number' ? value : 0;
                                        const getScoreColor = ( score ) => {
                                            if ( score >= 80 ) return '#00a32a';
                                            if ( score >= 60 ) return '#dba617';
                                            return '#d63384';
                                        };
                                        
                                        const getScoreLabel = ( key ) => {
                                            const labels = {
                                                overall: __( 'Overall', 'wegenius' ),
                                                seo: __( 'SEO', 'wegenius' ),
                                                readability: __( 'Readability', 'wegenius' ),
                                                structure: __( 'Structure', 'wegenius' ),
                                                engagement: __( 'Engagement', 'wegenius' )
                                            };
                                            return labels[ key ] || key.charAt( 0 ).toUpperCase() + key.slice( 1 );
                                        };
                                        
                                        return (
                                            <div key={ key } style={{ 
                                                padding: '0.5rem',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e9ecef',
                                                borderRadius: '0.25rem',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ 
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold',
                                                    color: getScoreColor( score ),
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    { score }
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.7rem',
                                                    color: '#6c757d',
                                                    fontWeight: '500'
                                                }}>
                                                    { getScoreLabel( key ) }
                                                </div>
                                            </div>
                                        );
                                    } ) }
                                </div>
                            </div>
                        </PanelRow>
                    </Panel>
                ) }
            </PanelBody>
        </PluginSidebar>
    );
};

// Register the plugin.
registerPlugin( 'wegenius-actions', { 
    render: WeGeniusActionsSidebar 
} );