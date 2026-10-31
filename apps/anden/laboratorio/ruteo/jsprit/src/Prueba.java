import com.graphhopper.jsprit.core.algorithm.VehicleRoutingAlgorithm;
import com.graphhopper.jsprit.core.algorithm.box.Jsprit;
import com.graphhopper.jsprit.core.algorithm.termination.TimeTermination;
import com.graphhopper.jsprit.core.problem.Location;
import com.graphhopper.jsprit.core.problem.VehicleRoutingProblem;
import com.graphhopper.jsprit.core.problem.cost.AbstractForwardVehicleRoutingTransportCosts;
import com.graphhopper.jsprit.core.problem.driver.Driver;
import com.graphhopper.jsprit.core.problem.job.Service;
import com.graphhopper.jsprit.core.problem.solution.VehicleRoutingProblemSolution;
import com.graphhopper.jsprit.core.problem.solution.route.VehicleRoute;
import com.graphhopper.jsprit.core.problem.solution.route.activity.TimeWindow;
import com.graphhopper.jsprit.core.problem.solution.route.activity.TourActivity;
import com.graphhopper.jsprit.core.problem.vehicle.*;
import java.io.*;
import java.util.*;

/** jsprit 2.0.0 sobre la misma instancia CABA (texto plano). Uso: java -cp ... Prueba <archivo> <segundos> */
public class Prueba {
    public static void main(String[] a) throws Exception {
        BufferedReader br = new BufferedReader(new FileReader(a[0]));
        double seg = Double.parseDouble(a[1]);
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), nt = Integer.parseInt(st.nextToken());
        String[] tipo = new String[nt]; int[] cant = new int[nt], cap = new int[nt]; long[] fijo = new long[nt], jor = new long[nt];
        for (int t = 0; t < nt; t++) { st = new StringTokenizer(br.readLine()); tipo[t] = st.nextToken(); cant[t] = Integer.parseInt(st.nextToken()); cap[t] = Integer.parseInt(st.nextToken()); fijo[t] = Long.parseLong(st.nextToken()); jor[t] = Long.parseLong(st.nextToken()); }
        st = new StringTokenizer(br.readLine()); long abre = Long.parseLong(st.nextToken()), cierra = Long.parseLong(st.nextToken());
        int[] dem = new int[n + 1]; long[] srv = new long[n + 1], a0 = new long[n + 1], b0 = new long[n + 1];
        for (int c = 1; c <= n; c++) { st = new StringTokenizer(br.readLine()); st.nextToken(); dem[c] = Integer.parseInt(st.nextToken()); srv[c] = Long.parseLong(st.nextToken()); a0[c] = Long.parseLong(st.nextToken()); b0[c] = Long.parseLong(st.nextToken()); }
        final double[][][] dur = new double[nt][n + 1][n + 1], cost = new double[nt][n + 1][n + 1];
        for (int t = 0; t < nt; t++) for (int k = 0; k < 2; k++) for (int i = 0; i <= n; i++) { st = new StringTokenizer(br.readLine()); for (int j = 0; j <= n; j++) { double v = Double.parseDouble(st.nextToken()); if (k == 0) dur[t][i][j] = v; else cost[t][i][j] = v; } }
        final Map<String, Integer> idx = new HashMap<>(); for (int t = 0; t < nt; t++) idx.put(tipo[t], t);
        VehicleRoutingProblem.Builder vb = VehicleRoutingProblem.Builder.newInstance();
        vb.setFleetSize(VehicleRoutingProblem.FleetSize.FINITE);
        Location dep = Location.Builder.newInstance().setIndex(0).build();
        for (int t = 0; t < nt; t++) {
            VehicleTypeImpl vt = VehicleTypeImpl.Builder.newInstance(tipo[t]).addCapacityDimension(0, cap[t]).setFixedCost(fijo[t]).build();
            for (int k = 0; k < cant[t]; k++) vb.addVehicle(VehicleImpl.Builder.newInstance(tipo[t] + "_" + k).setStartLocation(dep).setEndLocation(dep).setType(vt).setEarliestStart(abre).setLatestArrival(cierra).build());
        }
        for (int c = 1; c <= n; c++) vb.addJob(Service.Builder.newInstance("c" + c).addSizeDimension(0, dem[c]).setLocation(Location.Builder.newInstance().setIndex(c).build()).setServiceTime(srv[c]).setTimeWindow(TimeWindow.newInstance(a0[c], b0[c])).build());
        vb.setRoutingCost(new AbstractForwardVehicleRoutingTransportCosts() {
            public double getTransportTime(Location f, Location to, double dt, Driver d, Vehicle v) { if (v == null) { double s = 0; for (int t = 0; t < dur.length; t++) s += dur[t][f.getIndex()][to.getIndex()]; return s / dur.length; } return dur[idx.get(v.getType().getTypeId())][f.getIndex()][to.getIndex()]; }
            public double getTransportCost(Location f, Location to, double dt, Driver d, Vehicle v) { if (v == null) { double s = 0; for (int t = 0; t < cost.length; t++) s += cost[t][f.getIndex()][to.getIndex()]; return s / cost.length; } return cost[idx.get(v.getType().getTypeId())][f.getIndex()][to.getIndex()]; }
            public double getDistance(Location f, Location to, double dt, Vehicle v) { return 0; }
        });
        VehicleRoutingProblem prob = vb.build();
        VehicleRoutingAlgorithm alg = Jsprit.Builder.newInstance(prob).setProperty(Jsprit.Parameter.THREADS, "1").setProperty(Jsprit.Parameter.ITERATIONS, "100000000").buildAlgorithm();
        TimeTermination tt = new TimeTermination((long)(seg*1000)); alg.addListener(tt); alg.addTerminationCriterion(tt);
        long t0 = System.nanoTime();
        Collection<VehicleRoutingProblemSolution> sols = alg.searchSolutions();
        double el = (System.nanoTime() - t0) / 1e9;
        VehicleRoutingProblemSolution best = com.graphhopper.jsprit.core.util.Solutions.bestOf(sols);
        StringBuilder sb = new StringBuilder("RESULT " + el + " " + best.getCost() + " " + best.getUnassignedJobs().size() + "\n");
        for (VehicleRoute r : best.getRoutes()) {
            sb.append("R ").append(r.getVehicle().getType().getTypeId());
            for (TourActivity ta : r.getActivities()) sb.append(' ').append(((TourActivity.JobActivity) ta).getJob().getId().substring(1));
            sb.append('\n');
        }
        System.out.print(sb);
    }
}
