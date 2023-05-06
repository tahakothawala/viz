function reset(version2, version4) {
    // plot_mds_corr();
    mdsplot();
    heatmap("BMI", "Age", "CigsPerDay");
    scatterplot("Total Cholestrol", "BMI", "Heart Stroke");
    pcp();
    piechart("Heart Stroke", "None");
}