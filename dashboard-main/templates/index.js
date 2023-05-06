function index(isReset) {
    if(isReset){
        window.location.reload();
    }
    // plot_mds_corr();
    mdsplot();
    heatmap("BMI", "Age", "CigsPerDay");
    scatterplot("Total Cholestrol", "BMI", "Heart Stroke");
    pcp();
    piechart("Heart Stroke", "None");
}
